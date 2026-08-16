export function LicenseNotice() {
  return (
    <div style={{ marginTop: "2rem", fontSize: "0.8rem", color: "#666" }}>
      <p>AquesTalkを使用しています</p>
      <p>AquesTalkの著作権は株式会社アクエストに帰属します。</p>
      <p>
        漢字変換には{" "}
        <a
          href="https://github.com/y52en/AqKanji2Koe-OpenJTalk-WASM"
          target="_blank"
          rel="noreferrer"
        >
          kanji2koe-openjtalk
        </a>{" "}
        を使用しています（AqKanji2Koe とは無関係の再実装です）。
      </p>
      <p>
        中文 → koe は Love-Kogasa の zh-yukkuri.js を移植したものです（
        <a
          href="https://github.com/Love-Kogasa/pinyinToKana.js"
          target="_blank"
          rel="noreferrer"
        >
          pinyin-to-kana
        </a>
        {" / "}
        <a
          href="https://github.com/creeperyang/pinyin"
          target="_blank"
          rel="noreferrer"
        >
          tiny-pinyin
        </a>
        ）。
      </p>
    </div>
  );
}
