export function to_bytes_uint32(num: number): Uint8Array {
  return new Uint8Array([
    num & 0x000000ff,
    (num & 0x0000ff00) >> 8,
    (num & 0x00ff0000) >> 16,
    (num & 0xff000000) >> 24,
  ]);
}

export function from_bytes_uint32(bytes: Uint8Array): number {
  return (
    (bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24)) >>> 0
  );
}

export function encode_utf16le(str: string): Uint8Array {
  const bytes = new Uint8Array(str.length * 2);
  const view = new DataView(bytes.buffer);
  for (let i = 0; i < str.length; i++) {
    view.setUint16(i * 2, str.charCodeAt(i), true);
  }
  return bytes;
}

export function decode_utf16le(bytes: Uint8Array): string {
  return new TextDecoder("utf-16le").decode(bytes);
}

export function uint8array_concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  const c = new Uint8Array(a.length + b.length);
  c.set(a);
  c.set(b, a.length);
  return c;
}
