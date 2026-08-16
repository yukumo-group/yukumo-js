const DIGITS = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
const SECTION_UNITS = ["", "万", "亿", "兆"];

/**
 * Convert a finite number to simplified Chinese numerals.
 * Used so digits can go through the same pinyin → kana path as other text.
 */
export function numberToChineseWords(value: number): string {
  if (!Number.isFinite(value)) {
    throw new Error(`Cannot convert non-finite number ${value}`);
  }
  if (value < 0 || Object.is(value, -0)) {
    return `负${numberToChineseWords(Math.abs(value))}`;
  }
  if (value === 0) {
    return "零";
  }

  const [integerPart, decimalPart] = stringifyNumber(value).split(".");
  let result = convertInteger(integerPart);
  if (decimalPart != null && decimalPart !== "") {
    result += `点${[...decimalPart].map((digit) => DIGITS[Number(digit)] ?? digit).join("")}`;
  }
  return result;
}

/**
 * Replace decimal numbers (optional leading minus) with Chinese words.
 */
export function replaceNumbersWithChinese(text: string): string {
  return text.replace(/-?\d+(?:\.\d+)?/g, (matched) => {
    try {
      return numberToChineseWords(Number(matched));
    } catch {
      return matched;
    }
  });
}

function stringifyNumber(value: number): string {
  if (Number.isInteger(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER) {
    return String(value);
  }
  const asString = String(value);
  if (asString.includes("e") || asString.includes("E")) {
    throw new Error(`Cannot convert ${value} to Chinese words`);
  }
  return asString;
}

function convertInteger(digits: string): string {
  const n = Number(digits);
  if (n === 0) {
    return "零";
  }

  const parts: string[] = [];
  let remaining = n;
  let unitIndex = 0;
  let pendingZero = false;

  while (remaining > 0 && unitIndex < SECTION_UNITS.length) {
    const section = remaining % 10000;
    remaining = Math.floor(remaining / 10000);
    if (section === 0) {
      pendingZero = parts.length > 0;
    } else {
      let sectionText = convertSection(section);
      if (pendingZero) {
        sectionText = `零${sectionText}`;
      }
      parts.unshift(`${sectionText}${SECTION_UNITS[unitIndex]}`);
      pendingZero = false;
    }
    unitIndex += 1;
  }

  if (remaining > 0) {
    throw new Error(`Number ${digits} is too large`);
  }
  return parts.join("");
}

function convertSection(n: number): string {
  const thousand = Math.floor(n / 1000);
  const hundred = Math.floor((n % 1000) / 100);
  const ten = Math.floor((n % 100) / 10);
  const one = n % 10;
  let out = "";

  if (thousand) {
    out += `${DIGITS[thousand]}千`;
  }
  if (hundred) {
    out += `${DIGITS[hundred]}百`;
  } else if (thousand && (ten || one)) {
    out += "零";
  }
  if (ten) {
    out += ten === 1 && !thousand && !hundred ? "十" : `${DIGITS[ten]}十`;
  } else if ((thousand || hundred) && one) {
    out += "零";
  }
  if (one) {
    out += DIGITS[one];
  }
  return out;
}
