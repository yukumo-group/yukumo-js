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
  VirtualFS,
  installTeb,
  hook_lib_call,
  read_cstring,
  reg_read_uint32,
  reg_write_uint32,
  parsePE,
  mapPEImage,
} from "../../emu/index.js";
import { createHookMap } from "./iat.js";

/** Directory the dictionaries are mounted under in the virtual filesystem. */
export const DIC_DIR = "C:/aqdic";
export const SYS_DIC_NAME = "aqdic.bin";

const DLL_PROCESS_ATTACH = 1;
const RETURN_PAD_SIZE = 16;
const MIN_KOE_BUFFER = 4096;
/** A phonetic string stays within a few bytes per input byte. */
const KOE_BUFFER_RATIO = 8;

/** A guest buffer that is reused across calls and grown when needed. */
interface Scratch {
  address: number;
  size: number;
}

function encodeCString(str: string): Uint8Array {
  return uint8array_concat(new TextEncoder().encode(str), new Uint8Array([0]));
}

/**
 * AqKanji2Koe: converts mixed kanji/kana Japanese text into the phonetic
 * strings (koe) that the AquesTalk engines synthesize.
 */
export class AqKanji2Koe {
  readonly #emu: V86Emu;
  readonly #fs = new VirtualFS();
  readonly #heap: Heap;

  readonly HEAP_ADDRESS = 0x1800_0000;
  readonly HEAP_LENGTH = 0x1000_0000;
  readonly STACK_TOP = 0x3000_0000;
  readonly STACK_LIMIT = 0x2c00_0000;
  readonly HOOK_STUB_BASE = 0x2_0000;

  readonly #baseAddress: number;
  readonly #entryPoint: number;
  readonly #exports: Record<string, number>;

  #returnPad = 0;
  #handle = 0;
  #crtInitialized = false;
  #input: Scratch = { address: 0, size: 0 };
  #koe: Scratch = { address: 0, size: 0 };

  constructor(dll: ArrayBuffer, sysDic: Uint8Array, emu: V86Emu) {
    this.#emu = emu;
    this.#fs.addFile(`${DIC_DIR}/${SYS_DIC_NAME}`, sysDic);

    const pe = parsePE(dll);
    this.#baseAddress = pe.baseAddress;
    this.#entryPoint = pe.baseAddress + pe.entryPoint;
    this.#exports = pe.exports;

    emu.reset_cpu();
    emu.mem_write(this.#baseAddress, mapPEImage(dll));
    this.#heap = new Heap(emu, this.HEAP_ADDRESS, this.HEAP_LENGTH);
    this.#resetStack();
    installTeb(emu, this.#heap, this.STACK_TOP, this.STACK_LIMIT);

    this.#patchImports(pe.iatHooks);
    if (pe.adjustFdivTarget) {
      emu.mem_write(pe.adjustFdivTarget, to_bytes_uint32(0));
    }

    this.#returnPad = this.#heap.set_mem_value(
      emu,
      new Uint8Array(RETURN_PAD_SIZE).fill(NOP_CODE[0])
    );
  }

  #patchImports(iatHooks: Record<string, { rva: number }>) {
    const emu = this.#emu;
    const hookMap = createHookMap(emu, this.#heap, this.#fs);

    let stubAddr = this.HOOK_STUB_BASE;
    for (const [name, info] of Object.entries(iatHooks)) {
      const hook = hookMap[name];
      if (!hook) {
        continue;
      }
      hook_lib_call(emu, stubAddr, hook.handler, hook.arg);
      emu.mem_write(this.#baseAddress + info.rva, to_bytes_uint32(stubAddr));
      stubAddr += 16;
    }
  }

  /**
   * The statically linked CRT sets up its globals (heap, locale, encoded
   * function pointer table) from DllMain. Exports crash until that has run.
   */
  #initializeCrt() {
    if (this.#crtInitialized) {
      return;
    }
    this.#crtInitialized = true;
    const ok = this.#call("DllMain", this.#entryPoint, [
      this.#baseAddress,
      DLL_PROCESS_ATTACH,
      0,
    ]);
    if (ok === 0) {
      throw new Error("DllMain(DLL_PROCESS_ATTACH) failed");
    }
  }

  #resetStack() {
    reg_write_uint32(this.#emu, REG_ESP, this.STACK_TOP);
  }

  #resolveExport(name: string): number {
    const rva = this.#exports[name];
    if (!rva) {
      throw new Error(`${name} is not exported by this DLL`);
    }
    return this.#baseAddress + rva;
  }

  #invoke(name: string, args: number[]): number {
    return this.#call(name, this.#resolveExport(name), args);
  }

  #call(name: string, fnAddress: number, args: number[]): number {
    const emu = this.#emu;

    this.#resetStack();
    for (let i = args.length - 1; i >= 0; i--) {
      push(emu, args[i]);
    }

    emu.set_eip(this.#returnPad);
    call(emu, fnAddress);

    try {
      emu.emu_start(emu.get_eip(), this.#returnPad);
    } catch (e) {
      this.#resetStack();
      throw new Error(
        `${name} crashed at EIP 0x${emu.get_eip().toString(16)}: ${e}`
      );
    }

    return reg_read_uint32(emu, REG_EAX);
  }

  /** Grow a reusable guest buffer to at least `size` bytes. */
  #reserve(scratch: Scratch, size: number): number {
    if (scratch.size < size) {
      if (scratch.address) {
        this.#heap.release(scratch.address);
      }
      scratch.address = this.#heap.allocate(this.#emu, size);
      scratch.size = size;
    }
    return scratch.address;
  }

  /** Create the language processing instance, loading the system dictionary. */
  create(): void {
    if (this.#handle) {
      return;
    }
    this.#initializeCrt();

    const emu = this.#emu;
    const pathAddr = this.#heap.set_mem_value(emu, encodeCString(DIC_DIR));
    const errAddr = this.#heap.set_mem_value(emu, new Uint8Array(4));

    const handle = this.#invoke("AqKanji2Koe_Create", [pathAddr, errAddr]);
    if (!handle) {
      const code = from_bytes_uint32(emu.mem_read(errAddr, 4));
      throw new Error(`AqKanji2Koe_Create failed. ERROR CODE: ${code}`);
    }
    this.#handle = handle;
  }

  #convertWith(name: string, kanji: string): string {
    this.create();
    const emu = this.#emu;

    const input = encodeCString(kanji);
    const koeSize = Math.max(MIN_KOE_BUFFER, input.length * KOE_BUFFER_RATIO);
    const kanjiAddr = this.#reserve(this.#input, input.length);
    const koeAddr = this.#reserve(this.#koe, koeSize);
    emu.mem_write(kanjiAddr, input);

    const error = this.#invoke(name, [
      this.#handle,
      kanjiAddr,
      koeAddr,
      koeSize,
    ]);
    if (error !== 0) {
      throw new Error(`${name} error. ERROR CODE: ${error}`);
    }

    return new TextDecoder().decode(read_cstring(emu, koeAddr));
  }

  /** Convert to a kana phonetic string, for AquesTalk 1 / 2 / 10. */
  convert(kanji: string): string {
    return this.#convertWith("AqKanji2Koe_Convert_utf8", kanji);
  }

  /** Convert to a romaji phonetic string, for AquesTalk pico. */
  convertRoman(kanji: string): string {
    return this.#convertWith("AqKanji2Koe_ConvRoman_utf8", kanji);
  }

  /**
   * Apply a development licence key. Without one the library runs as an
   * evaluation build, which renders every na-row and ma-row mora as "nu".
   */
  setDevKey(key: string): number {
    this.#initializeCrt();
    const keyAddr = this.#heap.set_mem_value(this.#emu, encodeCString(key));
    return this.#invoke("AqKanji2Koe_SetDevKey", [keyAddr]);
  }

  release(): void {
    if (!this.#handle) {
      return;
    }
    this.#invoke("AqKanji2Koe_Release", [this.#handle]);
    this.#handle = 0;
  }

  async destroy(): Promise<void> {
    await this.#emu.destroy();
  }
}
