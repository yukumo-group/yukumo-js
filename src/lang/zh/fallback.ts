/**
 * Characters that already form an AquesTalk koe string after chineseToKoe:
 * hiragana/katakana plus accent, pause, and punctuation marks.
 */
const KOE_CHARS = "\\u3040-\\u309f\\u30a0-\\u30ff\\u3001\\u3002'/_?+\\-<>\\s,";
const NON_KOE_RUN = new RegExp(`[^${KOE_CHARS}]+`, "g");

/** Converter used for leftover non-koe segments, typically AqKanji2Koe. */
export interface KoeFallbackConverter {
  convert(text: string): string;
}

/**
 * Replace runs of non-koe characters (unconverted hanzi, Latin, etc.) by
 * calling `fallback.convert` on each run. Koe spans are left unchanged.
 */
export function applyKoeFallback(
  text: string,
  fallback: KoeFallbackConverter
): string {
  return text.replace(NON_KOE_RUN, (chunk) => fallback.convert(chunk));
}
