import { describe, expect, it } from "vitest";
import {
  ChineseToKoe,
  chineseToKoe,
  numberToChineseWords,
  replaceNumbersWithChinese,
  toKatakana,
} from "../../../src/lang/zh/index.js";

describe("numberToChineseWords", () => {
  it("converts integers", () => {
    expect(numberToChineseWords(0)).toBe("零");
    expect(numberToChineseWords(13)).toBe("十三");
    expect(numberToChineseWords(10)).toBe("十");
    expect(numberToChineseWords(20)).toBe("二十");
    expect(numberToChineseWords(101)).toBe("一百零一");
    expect(numberToChineseWords(10000)).toBe("一万");
  });

  it("converts decimals and negatives", () => {
    expect(numberToChineseWords(2.9)).toBe("二点九");
    expect(numberToChineseWords(-3)).toBe("负三");
  });
});

describe("replaceNumbersWithChinese", () => {
  it("replaces decimal numbers in place", () => {
    expect(replaceNumbersWithChinese("有13只猫")).toBe("有十三只猫");
    expect(replaceNumbersWithChinese("-2.5度")).toBe("负二点五度");
  });
});

describe("toKatakana", () => {
  it("converts hiragana only", () => {
    expect(toKatakana("こんにちはA")).toBe("コンニチハA");
  });
});

describe("chineseToKoe", () => {
  it("converts common Mandarin phrases to kana", () => {
    expect(chineseToKoe("你好")).toBe("ニーハオ");
    expect(chineseToKoe("我是飞舞")).toBe("ウオシーフェイウー");
    expect(chineseToKoe("世界")).toBe("シージエ");
  });

  it("converts numbers through Chinese numerals", () => {
    expect(chineseToKoe("13")).toBe("シーサン");
  });

  it("turns spaces into AquesTalk pauses", () => {
    expect(chineseToKoe("你好 世界")).toBe("ニーハオ,シージエ");
  });

  it("keeps leftover Japanese kana as katakana", () => {
    expect(chineseToKoe("你好わ")).toBe("ニーハオワ");
  });

  it("accepts a converter instance", () => {
    const converter = new ChineseToKoe({ commaPause: false });
    expect(converter.koe("你好 世界")).toBe("ニーハオ シージエ");
  });
});
