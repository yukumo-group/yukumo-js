import Encoding from "encoding-japanese";

export function convert_sjis(str: string): Uint8Array {
  const unicodeArray = Encoding.stringToCode(str);
  const sjisArray = Encoding.convert(unicodeArray, {
    to: "SJIS",
    from: "UNICODE",
  });
  return new Uint8Array(sjisArray);
}
