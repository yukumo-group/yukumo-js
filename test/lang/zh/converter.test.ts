import { describe, expect, it, vi } from "vitest";
import {
  ChineseToKoe,
  applyKoeFallback,
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

  it("leaves Latin leftovers for an AqKanji2Koe-style fallback", () => {
    const fallback = { convert: (chunk: string) => `<${chunk}>` };
    expect(chineseToKoe("你好hello", fallback)).toBe("ニーハオ<hello>");
    expect(chineseToKoe("hello你好world", fallback)).toBe(
      "<hello>ニーハオ<world>"
    );
    expect(chineseToKoe("你好！", fallback)).toBe("ニーハオ<！>");
    expect(chineseToKoe("你好-hello", fallback)).toBe("ニーハオ<-hello>");
    expect(chineseToKoe("hello-world", fallback)).toBe("<hello-world>");
  });

  it("does not call fallback when the Mandarin pipeline already produced koe", () => {
    const convert = vi.fn((chunk: string) => chunk);
    expect(chineseToKoe("你好 世界", { fallback: { convert } })).toBe(
      "ニーハオ,シージエ"
    );
    expect(convert).not.toHaveBeenCalled();
  });

  it("accepts fallback via options", () => {
    const converter = new ChineseToKoe({
      fallback: { convert: (chunk: string) => `[${chunk}]` },
    });
    expect(converter.koe("你好hello")).toBe("ニーハオ[hello]");
  });
});

describe("applyKoeFallback", () => {
  it("converts only non-koe runs", () => {
    const fallback = { convert: (chunk: string) => `<${chunk}>` };
    expect(applyKoeFallback("ニーハオhelloシージエ", fallback)).toBe(
      "ニーハオ<hello>シージエ"
    );
    expect(applyKoeFallback("ニーハオ-シージエ", fallback)).toBe(
      "ニーハオ<->シージエ"
    );
    expect(applyKoeFallback("hello-world", fallback)).toBe("<hello-world>");
  });

  it("does not duplicate 。 that AqKanji2Koe appends before an existing 。", () => {
    const fallback = { convert: (chunk: string) => `${chunk}。` };
    expect(applyKoeFallback("hello。ニーハオ。", fallback)).toBe(
      "hello。ニーハオ。"
    );
  });
});
