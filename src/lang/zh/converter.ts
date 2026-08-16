import Pinyin from "tiny-pinyin";
import { toKatakana } from "./katakana.js";
import { replaceNumbersWithChinese } from "./numbers.js";
import { PinyinToKana, type PinyinKanaMapping } from "./pinyin-to-kana.js";

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
}

/**
 * Convert Mandarin Chinese text to an AquesTalk koe (kana) string.
 *
 * Pipeline (adapted from Love-Kogasa's zh-yukkuri.js):
 * 1. Replace decimal numbers with Chinese numerals
 * 2. Hanzi → pinyin ([tiny-pinyin](https://github.com/creeperyang/pinyin))
 * 3. Pinyin → kana ([pinyin-to-kana](https://github.com/Love-Kogasa/pinyinToKana.js))
 * 4. Hiragana → katakana, spaces → commas
 */
export class ChineseToKoe {
  readonly #toKana: PinyinToKana;
  readonly #katakana: boolean;
  readonly #commaPause: boolean;

  constructor(options: ChineseToKoeOptions = {}) {
    this.#toKana = new PinyinToKana(options.mapping);
    this.#katakana = options.katakana ?? true;
    this.#commaPause = options.commaPause ?? true;
  }

  koe(text: string): string {
    let kana = this.#kanaify(replaceNumbersWithChinese(text));
    if (this.#katakana) {
      kana = toKatakana(kana);
    }
    if (this.#commaPause) {
      kana = kana.replace(/ /g, ",");
    }
    return kana;
  }

  #kanaify(text: string): string {
    const pinyin = Pinyin.parse(text.replace(/ /g, "_"))
      .map((token) => (token.type === 2 ? `${token.target} ` : token.source))
      .join("");
    return this.#toKana
      .pinyinToKana(pinyin)
      .replace(/\n/g, " ")
      .replace(/_/g, " ");
  }
}

const defaultConverter = new ChineseToKoe();

/** Convert Mandarin Chinese text to an AquesTalk koe string. */
export function chineseToKoe(
  text: string,
  options?: ChineseToKoeOptions
): string {
  if (options == null) {
    return defaultConverter.koe(text);
  }
  return new ChineseToKoe(options).koe(text);
}
