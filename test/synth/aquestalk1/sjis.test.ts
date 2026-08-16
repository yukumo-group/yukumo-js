import { describe, it, expect } from "vitest";
import { convert_sjis } from "../../../src/synth/aquestalk1/sjis";

describe("convert_sjis", () => {
  it("should convert ASCII string to Shift-JIS", () => {
    const result = convert_sjis("abc");
    expect(result).toEqual(new Uint8Array([0x61, 0x62, 0x63]));
  });

  it("should convert Japanese string to Shift-JIS", () => {
    const result = convert_sjis("\u3042");
    // "‚ " in Shift-JIS is 0x82 0xA0
    expect(result).toEqual(new Uint8Array([0x82, 0xa0]));
  });
});
