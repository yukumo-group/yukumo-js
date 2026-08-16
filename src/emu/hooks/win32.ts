import { V86Emu, REG_EAX } from "../v86.js";
import { reg_write_uint32 } from "../helpers.js";
import { get_arg, ret, ret_n } from "../x86.js";

const PROCESS_HEAP = 0x12340000;

export function heapAlloc_hook(emu: V86Emu, ...args: unknown[]) {
  const size = get_arg(emu, 2);
  const last_callback_arg = args[args.length - 1];
  if (typeof last_callback_arg != "function") {
    throw new Error("heapAlloc_hook: last argument must be a function");
  }
  const address = last_callback_arg(emu, new Uint8Array(size).fill(0));
  reg_write_uint32(emu, REG_EAX, address);
  ret_n(emu, 12);
}

export function heapFree_hook(emu: V86Emu, ..._args: unknown[]) {
  reg_write_uint32(emu, REG_EAX, 1);
  ret_n(emu, 12);
}

export function heapReAlloc_hook(emu: V86Emu, ...args: unknown[]) {
  const size = get_arg(emu, 3);
  const last_callback_arg = args[args.length - 1];
  if (typeof last_callback_arg != "function") {
    throw new Error("heapReAlloc_hook: last argument must be a function");
  }
  const address = last_callback_arg(emu, new Uint8Array(size).fill(0));
  reg_write_uint32(emu, REG_EAX, address);
  ret_n(emu, 16);
}

export function getProcessHeap_hook(emu: V86Emu, ..._args: unknown[]) {
  reg_write_uint32(emu, REG_EAX, PROCESS_HEAP);
  ret(emu);
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
