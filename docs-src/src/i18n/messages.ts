export type Locale = "en" | "ja" | "zh";

export const LOCALES: { id: Locale; label: string }[] = [
  { id: "ja", label: "日本語" },
  { id: "en", label: "English" },
  { id: "zh", label: "简体中文" },
];

export type Messages = {
  title: string;
  language: string;
  engine: string;
  voice: string;
  speed: string;
  convert: string;
  convertNone: string;
  convertJa: string;
  convertZh: string;
  convertLoading: string;
  placeholderNone: string;
  placeholderJa: string;
  placeholderZh: string;
  play: string;
  loading: string;
  stop: string;
  download: string;
  licenseAquestalk: string;
  licenseCopyright: string;
  licenseKanji: string;
  licenseZh: string;
  bas: string;
  spd: string;
  vol: string;
  pit: string;
  acc: string;
  lmd: string;
  fsc: string;
  basF1e: string;
  basF2e: string;
  basM1e: string;
  loadEngineFailed: string;
  loadKanjiFailed: string;
  aq1Voices: Record<string, string>;
  aq2Voices: Record<string, string>;
  aq10Voices: Record<string, string>;
};

export const messages: Record<Locale, Messages> = {
  ja: {
    title: "yukumo.js Demo",
    language: "言語",
    engine: "エンジン",
    voice: "声質",
    speed: "話速",
    convert: "変換",
    convertNone: "なし (koe)",
    convertJa: "日本語 (kanji2koe-openjtalk)",
    convertZh: "中文 (chineseToKoe)",
    convertLoading: "変換器を読み込み中...",
    placeholderNone: "喋らせたい文字を入力...",
    placeholderJa: "漢字かな交じり文を入力...",
    placeholderZh: "输入中文...",
    play: "PLAY!",
    loading: "読み込み中...",
    stop: "停止",
    download: "WAVをダウンロード",
    licenseAquestalk: "AquesTalkを使用しています",
    licenseCopyright: "AquesTalkの著作権は株式会社アクエストに帰属します。",
    licenseKanji:
      "漢字変換には {link} を使用しています（AqKanji2Koe とは無関係の再実装です）。",
    licenseZh:
      "中文 → koe は Love-Kogasa の zh-yukkuri.js を移植したものです（{pinyin} / {tiny}）。",
    bas: "基本素片",
    spd: "話速",
    vol: "音量",
    pit: "高さ",
    acc: "アクセント",
    lmd: "音程１",
    fsc: "音程２",
    basF1e: "F1E (女声)",
    basF2e: "F2E (女声)",
    basM1e: "M1E (男声)",
    loadEngineFailed: "エンジンの読み込みに失敗しました: {error}",
    loadKanjiFailed: "kanji2koe-openjtalk の読み込みに失敗しました: {error}",
    aq1Voices: {
      f1: "女声1 (f1)",
      f2: "女声2 (f2)",
      imd1: "中性 (imd1)",
      m1: "男声1 (m1)",
      m2: "男声2 (m2)",
      jgr: "機械1 (jgr)",
      dvd: "機械2 (dvd)",
      r1: "ロボット (r1)",
    },
    aq2Voices: {
      f1c: "女声 (f1c)",
      f3a: "女声 (f3a)",
      f4: "女声 (f4)",
      mf1: "中性 (mf1)",
      mf2: "中性 (mf2)",
      m4b: "男声 (m4b)",
      m5: "男声 (m5)",
      rm: "男声 (rm)",
      rm3: "男声 (rm3)",
      huskey: "ハスキー (huskey)",
      rb2: "ロボット (rb2)",
      rb3: "ロボット (rb3)",
      robo: "ロボット (robo)",
      yukkuri: "ゆっくり (yukkuri)",
    },
    aq10Voices: {
      f1: "女声 F1 (f1)",
      f2: "女声 F2 (f2)",
      f3: "女声 F3 (f3)",
      m1: "男声 M1 (m1)",
      m2: "男声 M2 (m2)",
      r1: "ロボット R1 (r1)",
      r2: "ロボット R2 (r2)",
      custom: "カスタム",
    },
  },
  en: {
    title: "yukumo.js Demo",
    language: "Language",
    engine: "Engine",
    voice: "Voice",
    speed: "Speed",
    convert: "Convert",
    convertNone: "None (koe)",
    convertJa: "Japanese (kanji2koe-openjtalk)",
    convertZh: "Chinese (chineseToKoe)",
    convertLoading: "Loading converter...",
    placeholderNone: "Enter text to speak...",
    placeholderJa: "Enter Japanese text (kanji/kana)...",
    placeholderZh: "Enter Chinese text...",
    play: "PLAY!",
    loading: "Loading...",
    stop: "Stop",
    download: "Download WAV",
    licenseAquestalk: "This demo uses AquesTalk.",
    licenseCopyright: "AquesTalk copyright belongs to Aquest Corp.",
    licenseKanji:
      "Kanji conversion uses {link} (an independent reimplementation, unrelated to AqKanji2Koe).",
    licenseZh:
      "Chinese → koe is ported from Love-Kogasa’s zh-yukkuri.js ({pinyin} / {tiny}).",
    bas: "Base",
    spd: "Speed",
    vol: "Volume",
    pit: "Pitch",
    acc: "Accent",
    lmd: "Pitch 1",
    fsc: "Pitch 2",
    basF1e: "F1E (Female)",
    basF2e: "F2E (Female)",
    basM1e: "M1E (Male)",
    loadEngineFailed: "Failed to load engine: {error}",
    loadKanjiFailed: "Failed to load kanji2koe-openjtalk: {error}",
    aq1Voices: {
      f1: "Female 1 (f1)",
      f2: "Female 2 (f2)",
      imd1: "Neutral (imd1)",
      m1: "Male 1 (m1)",
      m2: "Male 2 (m2)",
      jgr: "Machine 1 (jgr)",
      dvd: "Machine 2 (dvd)",
      r1: "Robot (r1)",
    },
    aq2Voices: {
      f1c: "Female (f1c)",
      f3a: "Female (f3a)",
      f4: "Female (f4)",
      mf1: "Neutral (mf1)",
      mf2: "Neutral (mf2)",
      m4b: "Male (m4b)",
      m5: "Male (m5)",
      rm: "Male (rm)",
      rm3: "Male (rm3)",
      huskey: "Husky (huskey)",
      rb2: "Robot (rb2)",
      rb3: "Robot (rb3)",
      robo: "Robot (robo)",
      yukkuri: "Yukkuri (yukkuri)",
    },
    aq10Voices: {
      f1: "Female F1 (f1)",
      f2: "Female F2 (f2)",
      f3: "Female F3 (f3)",
      m1: "Male M1 (m1)",
      m2: "Male M2 (m2)",
      r1: "Robot R1 (r1)",
      r2: "Robot R2 (r2)",
      custom: "Custom",
    },
  },
  zh: {
    title: "yukumo.js Demo",
    language: "语言",
    engine: "引擎",
    voice: "音色",
    speed: "语速",
    convert: "转换",
    convertNone: "无 (koe)",
    convertJa: "日语 (kanji2koe-openjtalk)",
    convertZh: "中文 (chineseToKoe)",
    convertLoading: "正在加载转换器...",
    placeholderNone: "输入要朗读的文本...",
    placeholderJa: "输入日语汉字假名混合文本...",
    placeholderZh: "输入中文...",
    play: "播放!",
    loading: "加载中...",
    stop: "停止",
    download: "下载 WAV",
    licenseAquestalk: "本演示使用 AquesTalk。",
    licenseCopyright: "AquesTalk 的著作权归 Aquest 株式会社所有。",
    licenseKanji:
      "汉字转换使用 {link}（与 AqKanji2Koe 无关的独立重新实现）。",
    licenseZh:
      "中文 → koe 移植自 Love-Kogasa 的 zh-yukkuri.js（{pinyin} / {tiny}）。",
    bas: "基本素片",
    spd: "语速",
    vol: "音量",
    pit: "音高",
    acc: "重音",
    lmd: "音程1",
    fsc: "音程2",
    basF1e: "F1E (女声)",
    basF2e: "F2E (女声)",
    basM1e: "M1E (男声)",
    loadEngineFailed: "引擎加载失败: {error}",
    loadKanjiFailed: "kanji2koe-openjtalk 加载失败: {error}",
    aq1Voices: {
      f1: "女声1 (f1)",
      f2: "女声2 (f2)",
      imd1: "中性 (imd1)",
      m1: "男声1 (m1)",
      m2: "男声2 (m2)",
      jgr: "机械1 (jgr)",
      dvd: "机械2 (dvd)",
      r1: "机器人 (r1)",
    },
    aq2Voices: {
      f1c: "女声 (f1c)",
      f3a: "女声 (f3a)",
      f4: "女声 (f4)",
      mf1: "中性 (mf1)",
      mf2: "中性 (mf2)",
      m4b: "男声 (m4b)",
      m5: "男声 (m5)",
      rm: "男声 (rm)",
      rm3: "男声 (rm3)",
      huskey: "沙哑 (huskey)",
      rb2: "机器人 (rb2)",
      rb3: "机器人 (rb3)",
      robo: "机器人 (robo)",
      yukkuri: "慢速 (yukkuri)",
    },
    aq10Voices: {
      f1: "女声 F1 (f1)",
      f2: "女声 F2 (f2)",
      f3: "女声 F3 (f3)",
      m1: "男声 M1 (m1)",
      m2: "男声 M2 (m2)",
      r1: "机器人 R1 (r1)",
      r2: "机器人 R2 (r2)",
      custom: "自定义",
    },
  },
};

const HTML_LANG: Record<Locale, string> = {
  en: "en",
  ja: "ja",
  zh: "zh-Hans",
};

export function localeToHtmlLang(locale: Locale): string {
  return HTML_LANG[locale];
}

export function detectLocale(): Locale {
  try {
    const stored = localStorage.getItem("yukumo-locale");
    if (stored === "en" || stored === "ja" || stored === "zh") {
      return stored;
    }
  } catch {
    /* ignore */
  }
  const nav = (navigator.language || "en").toLowerCase();
  if (nav.startsWith("ja")) return "ja";
  if (nav.startsWith("zh")) return "zh";
  return "en";
}

export function formatMessage(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "");
}
