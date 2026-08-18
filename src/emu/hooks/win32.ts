import { V86Emu, REG_EAX } from "../v86.js";
import { reg_write_uint32 } from "../helpers.js";
import { get_arg, ret, ret_n } from "../x86.js";

const PROCESS_HEAP = 0x12340000;

export function getProcessHeap_hook(emu: V86Emu, ..._args: unknown[]) {
  reg_write_uint32(emu, REG_EAX, PROCESS_HEAP);
  ret(emu);
}

export function stdcall_return(value: number, nbytes: number) {
  return (emu: V86Emu) => {
    reg_write_uint32(emu, REG_EAX, value);
    ret_n(emu, nbytes);
  };
}

/** Zero-fills an out-parameter struct pointed to by the first argument. */
export function stdcall_zero_struct(size: number, nbytes: number) {
  return (emu: V86Emu) => {
    const ptr = get_arg(emu, 0);
    if (ptr) {
      emu.mem_write(ptr, new Uint8Array(size));
    }
    reg_write_uint32(emu, REG_EAX, 1);
    ret_n(emu, nbytes);
  };
}

/**
 * Placeholder for imports we deliberately do not emulate. Raises instead of
 * letting the guest jump to an unrelocated IAT entry and crash obscurely.
 */
export function stdcall_unsupported(name: string) {
  return (_emu: V86Emu) => {
    throw new Error(`Unsupported import called by guest code: ${name}`);
  };
}

export function stdcall_return0(nbytes: number) {
  return (emu: V86Emu) => {
    reg_write_uint32(emu, REG_EAX, 0);
    ret_n(emu, nbytes);
  };
}

export function stdcall_return1(nbytes: number) {
  return (emu: V86Emu) => {
    reg_write_uint32(emu, REG_EAX, 1);
    ret_n(emu, nbytes);
  };
}

export function stdcall_identity(nbytes: number) {
  return (emu: V86Emu) => {
    reg_write_uint32(emu, REG_EAX, get_arg(emu, 0));
    ret_n(emu, nbytes);
  };
}

export function queryPerformanceCounter_hook(emu: V86Emu, ..._args: unknown[]) {
  const ptr = get_arg(emu, 0);
  if (ptr) {
    emu.mem_write(ptr, new Uint8Array(8));
  }
  reg_write_uint32(emu, REG_EAX, 1);
  ret_n(emu, 4);
}

export function getSystemTimeAsFileTime_hook(emu: V86Emu, ..._args: unknown[]) {
  const ptr = get_arg(emu, 0);
  if (ptr) {
    emu.mem_write(ptr, new Uint8Array(8));
  }
  ret_n(emu, 4);
}
