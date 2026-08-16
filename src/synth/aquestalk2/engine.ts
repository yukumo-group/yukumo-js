import {
  V86Emu,
  REG_EAX,
  REG_ESP,
  call,
  push,
  from_bytes_uint32,
  to_bytes_uint32,
  uint8array_concat,
  Heap,
  NOP_CODE,
  hook_lib_call,
  reg_read_uint32,
  reg_write_uint32,
  parsePE,
  mapPEImage,
  NATIVE_CLIB_BIN,
} from "../../emu/index.js";
import { convert_sjis } from "../aquestalk1/sjis.js";
import { createJsHookMap, NATIVE_IAT_HOOKS } from "../aquestalk1/iat.js";

export class AquesTalk2 {
  readonly #dll_file;
  readonly #dll_image;
  readonly #phont;
  readonly #emu;

  #baseAddress = 0x1000_0000;
  #aquesTalk2_SyntheAddress = 0;
  #iatHooks: { [key: string]: { rva: number; target: number } } = {};
  #adjustFdivTargetAddress = 0;
  #jsIatPatches: { rva: number; stub: number }[] = [];

  readonly HEAP_ADDRESS = 0x2000_0000;
  readonly HEAP_LENGTH = 0x1000_0000;
  readonly HOOK_STUB_BASE = 0x2_0000;
  #heap: Heap = null as unknown as Heap;

  constructor(file: ArrayBuffer, emu: V86Emu, phont: ArrayBuffer) {
    this.#dll_file = file;
    this.#dll_image = mapPEImage(file);
    this.#phont = new Uint8Array(phont);
    this.#emu = emu;
    this.#init();
  }

  #reset_esp() {
    reg_write_uint32(this.#emu, REG_ESP, this.HEAP_ADDRESS + this.HEAP_LENGTH);
  }

  #resolveExport(pe: { exports: Record<string, number> }, name: string): number {
    const rva = pe.exports[name];
    return rva ? this.#baseAddress + rva : 0;
  }

  #init() {
    const emu = this.#emu;

    const pe = parsePE(this.#dll_file);
    this.#baseAddress = pe.baseAddress;
    this.#aquesTalk2_SyntheAddress = this.#resolveExport(
      pe,
      "AquesTalk2_Synthe"
    );
    if (!this.#aquesTalk2_SyntheAddress) {
      throw new Error("AquesTalk2_Synthe is not exported by this DLL");
    }
    this.#iatHooks = pe.iatHooks;
    this.#adjustFdivTargetAddress = pe.adjustFdivTarget;

    emu.mem_write(this.#baseAddress, this.#dll_image);

    this.#heap = new Heap(emu, this.HEAP_ADDRESS, this.HEAP_LENGTH);
    this.#reset_esp();

    const alloc = (e: V86Emu, value: Uint8Array) =>
      this.#heap.set_mem_value(e, value);

    const hookMap = createJsHookMap(alloc);

    let stubAddr = this.HOOK_STUB_BASE;
    for (const [name, info] of Object.entries(this.#iatHooks)) {
      const hook = hookMap[name];
      if (!hook) {
        continue;
      }
      hook_lib_call(emu, stubAddr, hook.handler, hook.arg);
      this.#jsIatPatches.push({ rva: info.rva, stub: stubAddr });
      stubAddr += 16;
    }

    this.#applyJsIatPatches();

    if (this.#adjustFdivTargetAddress) {
      emu.mem_write(this.#adjustFdivTargetAddress, to_bytes_uint32(0));
    }
  }

  #applyJsIatPatches() {
    for (const { rva, stub } of this.#jsIatPatches) {
      this.#emu.mem_write(this.#baseAddress + rva, to_bytes_uint32(stub));
    }
  }

  #reset() {
    this.#heap.clear_heap(this.#emu);
    reg_write_uint32(this.#emu, REG_EAX, 0);
    this.#reset_esp();
  }

  #setupEmulation() {
    const emu = this.#emu;

    emu.reset_cpu();
    this.#reset_esp();

    emu.mem_write(this.#baseAddress, this.#dll_image);
    this.#applyJsIatPatches();
    if (this.#adjustFdivTargetAddress) {
      emu.mem_write(this.#adjustFdivTargetAddress, to_bytes_uint32(0));
    }

    const native_code_addr = this.#heap.set_mem_value(emu, NATIVE_CLIB_BIN);

    for (const [name, offset] of Object.entries(NATIVE_IAT_HOOKS)) {
      const info = this.#iatHooks[name];
      if (info) {
        emu.mem_write(
          this.#baseAddress + info.rva,
          to_bytes_uint32(native_code_addr + offset)
        );
      }
    }
  }

  #invoke(fnAddress: number, args: number[], nopLength = 16): number {
    const emu = this.#emu;

    for (let i = args.length - 1; i >= 0; i--) {
      push(emu, args[i]);
    }

    const return_fn_addr = this.#heap.set_mem_value(
      emu,
      new Uint8Array(nopLength).fill(NOP_CODE[0])
    );
    emu.set_eip(return_fn_addr);
    call(emu, fnAddress);

    try {
      emu.emu_start(emu.get_eip(), return_fn_addr);
    } catch (e) {
      console.error(e);
      console.error(`error at: EIP: `, emu.get_eip().toString(16));
      console.error(
        `error at: ESP:`,
        reg_read_uint32(emu, REG_ESP).toString(16)
      );
      this.#reset();

      throw e;
    }

    return reg_read_uint32(emu, REG_EAX);
  }

  run(koe: string, speed: number = 100) {
    const emu = this.#emu;

    this.#setupEmulation();
    this.#reset_esp();

    // Keep phont bytes in guest memory; the DLL reads them by pointer
    // and must not go through a host/guest filesystem.
    const phont_addr = this.#heap.set_mem_value(emu, this.#phont);
    const size = this.#heap.set_mem_value(emu, new Uint8Array(8).fill(0));
    const koe_addr = this.#heap.set_mem_value(
      emu,
      uint8array_concat(convert_sjis(koe), new Uint8Array([0x0]))
    );

    const return_value = this.#invoke(
      this.#aquesTalk2_SyntheAddress,
      [koe_addr, speed, size, phont_addr],
      1048576
    );

    const size_value = from_bytes_uint32(emu.mem_read(size, 4));

    if (return_value === 0) {
      throw new Error(`AquesTalk2_Synthe error. ERROR CODE: ${size_value}`);
    }
    const result = emu.mem_read(return_value, size_value);

    this.#reset();
    return result;
  }

  async destroy(): Promise<void> {
    await this.#emu.destroy();
  }
}
