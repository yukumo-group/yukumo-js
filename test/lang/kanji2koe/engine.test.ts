import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  loadAqKanji2Koe,
  AqKanji2Koe,
} from "../../../src/lang/kanji2koe/index.js";

/** Katakana, prosody marks and punctuation: everything AquesTalk accepts. */
const KOE_PATTERN = /^[\u30a0-\u30ff\u3001\u3002'\/_?+\-<>\s]+$/;

describe("AqKanji2Koe Integration", () => {
  let k2k: AqKanji2Koe;

  beforeAll(async () => {
    k2k = await loadAqKanji2Koe();
  }, 120000);

  afterAll(async () => {
    k2k.release();
    await k2k.destroy();
  });

  it("converts mixed kanji/kana text to a kana phonetic string", () => {
    // kyou wa ii tenki desu.
    const koe = k2k.convert(
      "\u4eca\u65e5\u306f\u3044\u3044\u5929\u6c17\u3067\u3059\u3002"
    );

    expect(koe).toMatch(KOE_PATTERN);
    expect(koe).toContain("\u30ad\u30e7"); // kyo
    expect(koe).toContain("\u30c6'\u30f3\u30ad"); // te'nki
  }, 30000);

  it("reads kanji that only the system dictionary knows", () => {
    const koe = k2k.convert("\u6771\u4eac\u90fd"); // toukyou-to

    expect(koe.startsWith("\u30c8\u30fc\u30ad\u30e7")).toBe(true); // to-kyo
  }, 30000);

  it("converts to a romaji phonetic string for AquesTalk pico", () => {
    const roman = k2k.convertRoman("\u4eca\u65e5\u306f"); // kyou wa

    expect(roman).toMatch(/^[\x20-\x7e]+$/);
    expect(roman).toContain("kyo");
  }, 30000);

  it("is stable and leak-free across repeated calls", () => {
    // yukkuri shite itte ne!
    const text =
      "\u3086\u3063\u304f\u308a\u3057\u3066\u3044\u3063\u3066\u306d\uff01";
    const first = k2k.convert(text);

    for (let i = 0; i < 20; i++) {
      expect(k2k.convert(text)).toBe(first);
    }
  }, 60000);

  it("handles input longer than the minimum output buffer", () => {
    const text = "\u3042\u3044\u3046\u3048\u304a".repeat(300); // 1500 mora

    expect(k2k.convert(text).length).toBeGreaterThan(1000);
  }, 30000);

  it("rejects a dummy development key", () => {
    expect(k2k.setDevKey("dummy-dev-key")).toBe(1);
  }, 30000);
});

describe("AqKanji2Koe dictionary loading", () => {
  it("reports the dictionary error code when the system dictionary is invalid", async () => {
    const { V86Emu } = await import("../../../src/emu/index.js");
    const { extractFrom7z, resolveThirdsArchive, resolveWasmPath } =
      await import("../../../src/assets/index.js");
    const { DLL_PATH } = await import("../../../src/lang/kanji2koe/load.js");

    const dll = await extractFrom7z(resolveThirdsArchive(), DLL_PATH);
    const emu = new V86Emu();
    await emu.init({ wasmPath: await resolveWasmPath() });

    const k2k = new AqKanji2Koe(dll, new Uint8Array(64), emu);
    try {
      expect(() => k2k.create()).toThrow(/ERROR CODE: \d+/);
    } finally {
      await k2k.destroy();
    }
  }, 120000);
});
