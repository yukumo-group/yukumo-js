/** Convert hiragana in `input` to katakana. Other characters are unchanged. */
export function toKatakana(input: string): string {
  return input.replace(/[\u3041-\u3096]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60)
  );
}
