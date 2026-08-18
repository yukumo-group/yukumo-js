export { V86Emu, REG_EAX, REG_ECX, REG_EDX, REG_EBX, REG_ESP, REG_EBP, REG_ESI, REG_EDI } from "./v86.js";
export type { EmuOptions } from "./v86.js";
export { Heap, NOP_CODE } from "./heap.js";
export { VirtualFS, normalizePath } from "./fs.js";
export { installTeb } from "./teb.js";
export {
  hook_lib_call,
  reg_read_uint32,
  reg_write_uint32,
  align_to_0x1000,
  read_wide_string,
  read_cstring,
} from "./helpers.js";
export { push, pop, jmp, call, ret, ret_n, get_arg } from "./x86.js";
export {
  to_bytes_uint32,
  from_bytes_uint32,
  uint8array_concat,
  encode_utf16le,
} from "./bytes.js";
export { parsePE, mapPEImage } from "./pe.js";
export type { PEResult } from "./pe.js";
export { NATIVE_CLIB_BIN, NATIVE_CLIB_SYMBOLS } from "./native_code.js";
export * from "./hooks/index.js";
