import { V86Emu } from "./v86.js";

export function hook_lib_call(
  emu: V86Emu,
  address: number,
  callback: (emu: V86Emu, ...args: any[]) => void,
  arg: any = null
) {
  emu.set_hook(address, (emu: V86Emu, userData: any) => {
    callback(emu, userData);
  }, arg);
}

export function reg_read_uint32(emu: V86Emu, reg: number): number {
  return emu.reg_read(reg);
}

export function reg_write_uint32(emu: V86Emu, reg: number, value: number) {
  emu.reg_write(reg, value);
}

export function align_to_0x1000(number: number): number {
  return Math.floor((number + 0xfff) / 0x1000) * 0x1000;
}

const STRING_CHUNK_SIZE = 256;

/** Read a NUL-terminated UTF-16LE string from emulated memory. */
export function read_wide_string(emu: V86Emu, address: number): string {
  let result = "";
  for (let offset = 0; ; offset += STRING_CHUNK_SIZE) {
    const chunk = emu.mem_read(address + offset, STRING_CHUNK_SIZE);
    for (let i = 0; i < STRING_CHUNK_SIZE; i += 2) {
      const code = chunk[i] | (chunk[i + 1] << 8);
      if (code === 0) {
        return result;
      }
      result += String.fromCharCode(code);
    }
  }
}

/** Read a NUL-terminated byte string from emulated memory. */
export function read_cstring(emu: V86Emu, address: number): Uint8Array {
  const parts: Uint8Array[] = [];
  for (let offset = 0; ; offset += STRING_CHUNK_SIZE) {
    const chunk = emu.mem_read(address + offset, STRING_CHUNK_SIZE);
    const end = chunk.indexOf(0);
    if (end >= 0) {
      parts.push(chunk.subarray(0, end));
      break;
    }
    parts.push(chunk);
  }
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const result = new Uint8Array(total);
  let position = 0;
  for (const part of parts) {
    result.set(part, position);
    position += part.length;
  }
  return result;
}
