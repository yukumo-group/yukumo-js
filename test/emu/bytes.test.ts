import { describe, it, expect } from "vitest";
import { to_bytes_uint32, from_bytes_uint32, uint8array_concat } from "../../src/emu/bytes";

describe("bytes", () => {
  describe("to_bytes_uint32", () => {
    it("should convert 0 to bytes", () => {
      expect(to_bytes_uint32(0)).toEqual(new Uint8Array([0, 0, 0, 0]));
    });

    it("should convert max uint32 to bytes", () => {
      expect(to_bytes_uint32(0xffffffff)).toEqual(new Uint8Array([0xff, 0xff, 0xff, 0xff]));
    });

    it("should convert 0x12345678 to bytes", () => {
      expect(to_bytes_uint32(0x12345678)).toEqual(new Uint8Array([0x78, 0x56, 0x34, 0x12]));
    });
  });

  describe("from_bytes_uint32", () => {
    it("should convert bytes to 0", () => {
      expect(from_bytes_uint32(new Uint8Array([0, 0, 0, 0]))).toBe(0);
    });

    it("should convert bytes to max uint32", () => {
      expect(from_bytes_uint32(new Uint8Array([0xff, 0xff, 0xff, 0xff]))).toBe(0xffffffff);
    });

    it("should convert bytes to 0x12345678", () => {
      expect(from_bytes_uint32(new Uint8Array([0x78, 0x56, 0x34, 0x12]))).toBe(0x12345678);
    });
  });

  describe("uint8array_concat", () => {
    it("should concatenate two Uint8Arrays", () => {
      const a = new Uint8Array([1, 2]);
      const b = new Uint8Array([3, 4]);
      expect(uint8array_concat(a, b)).toEqual(new Uint8Array([1, 2, 3, 4]));
    });

    it("should handle empty arrays", () => {
      const a = new Uint8Array([]);
      const b = new Uint8Array([1, 2]);
      expect(uint8array_concat(a, b)).toEqual(new Uint8Array([1, 2]));
    });
  });
});
