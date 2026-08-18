/**
 * Characters that already form an AquesTalk koe string after chineseToKoe:
 * hiragana/katakana plus accent, pause, and punctuation marks.
 * ASCII hyphen is excluded so it is sent to AqKanji2Koe (chouon is U+30FC).
 */
const KOE_CHARS = "\\u3040-\\u309f\\u30a0-\\u30ff\\u3001\\u3002'/_?+<>\\s,";
const NON_KOE_RUN = new RegExp(`[^${KOE_CHARS}]+`, "g");
const IDEOGRAPHIC_FULL_STOP = "\u3002";
const FALLBACK_PUNCT = new Set(["\u3002", "\u3001", "\uff0e", "."]);

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
  const parts: string[] = [];
  let lastIndex = 0;
  for (const match of text.matchAll(NON_KOE_RUN)) {
    const chunk = match[0];
    const index = match.index ?? 0;
    parts.push(text.slice(lastIndex, index));
    const after = text.slice(index + chunk.length);
    parts.push(stripDuplicateTrailingPunct(fallback.convert(chunk), after));
    lastIndex = index + chunk.length;
  }
  parts.push(text.slice(lastIndex));
  return parts.join("").replace(/\u3002{2,}/g, IDEOGRAPHIC_FULL_STOP);
}

/** AqKanji2Koe often appends U+3002; drop it when the following koe already has one. */
function stripDuplicateTrailingPunct(converted: string, after: string): string {
  let result = converted;
  while (result.length > 0) {
    const last = result[result.length - 1]!;
    if (!FALLBACK_PUNCT.has(last) || !after.startsWith(last)) {
      break;
    }
    result = result.slice(0, -1);
  }
  return result;
}
