export {
  ChineseToKoe,
  chineseToKoe,
  applyKoeFallback,
  PinyinToKana,
  PINYIN_KANA_MAP,
  numberToChineseWords,
  replaceNumbersWithChinese,
  toKatakana,
} from "./zh/index.js";
export type {
  ChineseToKoeOptions,
  KoeFallbackConverter,
  PinyinKanaMapping,
} from "./zh/index.js";
export {
  AqKanji2Koe,
  loadAqKanji2Koe,
  loadAqKanji2KoeFromArchive,
  DIC_DIR,
  SYS_DIC_NAME,
} from "./kanji2koe/index.js";
export type { Options as AqKanji2KoeOptions } from "./kanji2koe/index.js";
