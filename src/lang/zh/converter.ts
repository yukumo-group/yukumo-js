import Pinyin from "tiny-pinyin";
import {
  applyKoeFallback,
  type KoeFallbackConverter,
} from "./fallback.js";
import { toKatakana } from "./katakana.js";
import { replaceNumbersWithChinese } from "./numbers.js";
import { PinyinToKana, type PinyinKanaMapping } from "./pinyin-to-kana.js";

export type { KoeFallbackConverter } from "./fallback.js";
export { applyKoeFallback } from "./fallback.js";

export interface ChineseToKoeOptions {
  /**
   * Custom pinyin→kana mapping as TSV text (`pinyin<TAB>kana` per line)
   * or a record. Defaults to the bundled Heibonsha-based mapping.
   */
  mapping?: PinyinKanaMapping;
  /** Convert leftover hiragana to katakana. Default: true. */
  katakana?: boolean;
  /** Replace spaces with AquesTalk pause commas. Default: true. */
  commaPause?: boolean;
  /**
   * Convert leftover non-koe segments (unconverted hanzi, Latin, …)
   * after the Mandarin pipeline, typically via AqKanji2Koe.
   */
  fallback?: KoeFallbackConverter;
}

/**
 * Convert Mandarin Chinese text to an AquesTalk koe (kana) string.
 *
 * Pipeline (adapted from Love-Kogasa's zh-yukkuri.js):
 * 1. Replace decimal numbers with Chinese numerals
 * 2. Hanzi → pinyin ([tiny-pinyin](https://github.com/creeperyang/pinyin))
 * 3. Pinyin → kana ([pinyin-to-kana](https://github.com/Love-Kogasa/pinyinToKana.js))
 * 4. Hiragana → katakana, spaces → commas
 * 5. Optional fallback converts leftover non-koe runs (AqKanji2Koe)
 */
export class ChineseToKoe {
  readonly #toKana: PinyinToKana;
  readonly #katakana: boolean;
  readonly #commaPause: boolean;
  readonly #fallback: KoeFallbackConverter | undefined;

  constructor(options: ChineseToKoeOptions = {}) {
    this.#toKana = new PinyinToKana(options.mapping);
    this.#katakana = options.katakana ?? true;
    this.#commaPause = options.commaPause ?? true;
    this.#fallback = options.fallback;
  }

  koe(
    text: string,
    fallback: KoeFallbackConverter | undefined = this.#fallback
  ): string {
    let kana = this.#kanaify(replaceNumbersWithChinese(text));
    if (this.#katakana) {
      kana = toKatakana(kana);
    }
    if (this.#commaPause) {
      kana = kana.replace(/ /g, ",");
    }
    if (fallback != null) {
      kana = applyKoeFallback(kana, fallback);
    }
    return kana;
  }

  #kanaify(text: string): string {
    const pinyin = Pinyin.parse(text.replace(/ /g, "_"))
      .map((token) => (token.type === 2 ? ` ${token.target} ` : token.source))
      .join("");
    return this.#toKana
      .pinyinToKana(pinyin)
      .replace(/\n/g, " ")
      .replace(/_/g, " ");
  }
}

const defaultConverter = new ChineseToKoe();

function isKoeFallbackConverter(
  value: ChineseToKoeOptions | KoeFallbackConverter
): value is KoeFallbackConverter {
  return (
    typeof (value as KoeFallbackConverter).convert === "function" &&
    !("mapping" in value) &&
    !("katakana" in value) &&
    !("commaPause" in value) &&
    !("fallback" in value)
  );
}

/** Convert Mandarin Chinese text to an AquesTalk koe string. */
export function chineseToKoe(
  text: string,
  optionsOrFallback?: ChineseToKoeOptions | KoeFallbackConverter
): string {
  if (optionsOrFallback == null) {
    return defaultConverter.koe(text);
  }
  if (isKoeFallbackConverter(optionsOrFallback)) {
    return defaultConverter.koe(text, optionsOrFallback);
  }
  return new ChineseToKoe(optionsOrFallback).koe(text);
}
