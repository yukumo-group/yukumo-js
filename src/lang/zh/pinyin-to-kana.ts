import { PINYIN_KANA_MAP } from "./mapping.js";

export type PinyinKanaMapping = string | Record<string, string>;

/**
 * Convert pinyin syllables to katakana.
 *
 * Port of [pinyin-to-kana](https://github.com/Love-Kogasa/pinyinToKana.js),
 * itself a JavaScript implementation of [uiur/pinyin_to_kana](https://github.com/uiur/pinyin_to_kana).
 */
export class PinyinToKana {
  readonly #map: Map<string, string>;

  constructor(mapping: PinyinKanaMapping = PINYIN_KANA_MAP) {
    this.#map = loadMapping(mapping);
  }

  pinyinToKana(pinyin: string): string {
    const prepared = pinyin
      .replace(/，/g, "、")
      .replace(/([^a-zA-Z ]+)/g, " $1 ");
    return this.#lookupSyllables(prepared);
  }

  #lookupSyllables(pinyin: string): string {
    return pinyin
      .trim()
      .toLowerCase()
      .split(" ")
      .map((token) => this.#lookup(token))
      .join("");
  }

  #lookup(token: string): string {
    if (token === "") {
      return "";
    }
    const key = token.normalize("NFC");
    return this.#map.get(key) ?? this.#map.get(key.replace(/ü/g, "v")) ?? token;
  }
}

function loadMapping(mapping: PinyinKanaMapping): Map<string, string> {
  if (typeof mapping !== "string") {
    return new Map(
      Object.entries(mapping).map(([key, value]) => [
        key.normalize("NFC").toLowerCase(),
        value,
      ])
    );
  }

  const map = new Map<string, string>();
  for (const line of mapping.split(/\r?\n/)) {
    if (line === "") {
      continue;
    }
    const tab = line.indexOf("\t");
    if (tab < 0) {
      continue;
    }
    const key = line.slice(0, tab).normalize("NFC").trim().toLowerCase();
    const value = line.slice(tab + 1).trim();
    if (key !== "") {
      map.set(key, value);
    }
  }
  return map;
}
