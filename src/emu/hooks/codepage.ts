/**
 * MultiByteToWideChar / WideCharToMultiByte.
 *
 * The code page argument is ignored and UTF-8 is always used, which matches the
 * UTF-8 ANSI code page reported by the `GetACP` stub.
 */

import { V86Emu, REG_EAX } from "../v86.js";
import { reg_write_uint32, read_wide_string, read_cstring } from "../helpers.js";
import { get_arg, ret_n } from "../x86.js";
import { encode_utf16le, decode_utf16le } from "../bytes.js";

const NUL = "\0";

function complete(emu: V86Emu, result: number, stackBytes: number) {
  reg_write_uint32(emu, REG_EAX, result);
  ret_n(emu, stackBytes);
}

export function multiByteToWideChar_hook(emu: V86Emu) {
  const source = get_arg(emu, 2);
  const sourceBytes = get_arg(emu, 3) | 0;
  const dest = get_arg(emu, 4);
  const destChars = get_arg(emu, 5);

  // A negative length means the input is NUL-terminated and the terminator is
  // part of the conversion.
  const text =
    sourceBytes < 0
      ? new TextDecoder().decode(read_cstring(emu, source)) + NUL
      : new TextDecoder().decode(emu.mem_read(source, sourceBytes));

  if (destChars === 0) {
    complete(emu, text.length, 24);
    return;
  }
  if (text.length > destChars) {
    complete(emu, 0, 24);
    return;
  }

  emu.mem_write(dest, encode_utf16le(text));
  complete(emu, text.length, 24);
}

export function wideCharToMultiByte_hook(emu: V86Emu) {
  const source = get_arg(emu, 2);
  const sourceChars = get_arg(emu, 3) | 0;
  const dest = get_arg(emu, 4);
  const destBytes = get_arg(emu, 5);

  const text =
    sourceChars < 0
      ? read_wide_string(emu, source) + NUL
      : decode_utf16le(emu.mem_read(source, sourceChars * 2));
  const encoded = new TextEncoder().encode(text);

  if (destBytes === 0) {
    complete(emu, encoded.length, 32);
    return;
  }
  if (encoded.length > destBytes) {
    complete(emu, 0, 32);
    return;
  }

  emu.mem_write(dest, encoded);
  complete(emu, encoded.length, 32);
}
