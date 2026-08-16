# yukumo.js

[English](README.md) | [中文](README.zh.md) | **日本語**

AquesTalkをWebAssembly(v86)環境で動かし、ブラウザやNode.jsで利用できるようにしたライブラリです。

DEMO: [https://aquestalk-js.y52.dev](https://aquestalk-js.y52.dev)

## 特徴

- ブラウザ上でAquesTalk(Win32版)をエミュレートして音声合成
- **AquesTalk1** 音声: `f1`, `f2`, `m1`, `m2`, `dvd`, `imd1`, `jgr`, `r1`
- **AquesTalk2** 音声 (phont): `f1c`, `f3a`, `f4`, `mf1`, `mf2`, `m4b`, `m5`, `rm`, `rm3`, `huskey`, `rb2`, `rb3`, `robo`, `yukkuri`
- **AquesTalk10** プリセット: `f1`, `f2`, `f3`, `m1`, `m2`, `r1`, `r2`（またはカスタム `AqtkVoice`）
- TypeScript対応
- [AqKanji2Koe-OpenJTalk-WASM](https://github.com/y52en/AqKanji2Koe-OpenJTalk-WASM) / [`kanji2koe-openjtalk`](https://www.npmjs.com/package/kanji2koe-openjtalk) と組み合わせて漢字かな交じり文を読み上げ可能
- 中国語（普通話）→ koe は `yukumo.js/lang/zh`

## インストール

```bash
npm install yukumo.js
```

## 基本的な例（AquesTalk1）

`run()` は AquesTalk 音声記号列を入力に取ります。

```typescript
import { load } from "yukumo.js";

async function main() {
  const aq = await load("f1");
  const wav = aq.run("こんにちは", 100);

  const blob = new Blob([wav], { type: "audio/wav" });
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  await audio.play();

  await aq.destroy();
}

main();
```

## AquesTalk2 / AquesTalk10

```typescript
import { loadAquesTalk2, loadAquesTalk10 } from "yukumo.js";

const aq2 = await loadAquesTalk2("yukkuri");
const wav2 = aq2.run("こんにちは", 100);

const aq10 = await loadAquesTalk10("f1");
const wav10 = aq10.run("こんにちは", 100, "f1");
```

AquesTalk1 / AquesTalk10 は DLL がエクスポートしていれば `SetDevKey` / `SetUsrKey` を利用できます。

## 漢字かな交じり文を読み上げる

```bash
npm install yukumo.js kanji2koe-openjtalk
```

```typescript
import { load as loadAquesTalk1 } from "yukumo.js";
import { load as loadKanji2Koe } from "kanji2koe-openjtalk";

const kanji2koe = await loadKanji2Koe();
const aq = await loadAquesTalk1("f1");

const koe = kanji2koe.convert("今日は良い天気ですね。");
const wav = aq.run(koe, 100);

await aq.destroy();
```

関連:

- GitHub: [AqKanji2Koe-OpenJTalk-WASM](https://github.com/y52en/AqKanji2Koe-OpenJTalk-WASM)
- npm: [`kanji2koe-openjtalk`](https://www.npmjs.com/package/kanji2koe-openjtalk)

## 中国語（普通話）→ koe

`yukumo.js/lang/zh` を使います。漢字の日本語読みではなく、普通話の発音をカナで近似します。

```typescript
import { load } from "yukumo.js";
import { chineseToKoe } from "yukumo.js/lang/zh";

const aq = await load("f1");
const koe = chineseToKoe("你好，世界");
const wav = aq.run(koe, 100);

await aq.destroy();
```

## API

### `load(voice, options?): Promise<AquesTalk1>`

- `voice`: `"f1" | "f2" | "m1" | "m2" | "dvd" | "imd1" | "jgr" | "r1"`
- `options.baseUrl`: アセットのベース URL
- `options.wasmPath`: `v86.wasm` へのパス
- `options.memorySize`: エミュレータメモリ（**バイト**、デフォルト `1024 * 1024 * 1024`）

### `loadAquesTalk1` / `loadAquesTalk2` / `loadAquesTalk10`

同梱 7z または独自アーカイブから読み込みます。AquesTalk2 は DLL + 音声ごとの phont、AquesTalk10 は DLL 1 本で `run()` 時に声質を指定します。

### `run(koe, speed?)`

WAV の `Uint8Array` を返します。`speed` は 50〜300、デフォルト 100。AquesTalk10 はプリセット名または `{ bas, spd, vol, pit, acc, lmd, fsc }` を渡せます。

### `destroy(): Promise<void>`

エミュレータを停止し、リソースを解放します。

## ライセンス

### yukumo.js（このライブラリ）

[MIT License](LICENSE)

### AquesTalk（エンジンの著作権）

AquesTalkの著作権は株式会社アクエストに帰属します。
利用にあたっては[アクエスト社のライセンス規定](https://www.a-quest.com/licence.html)に従ってください。
詳細なライセンス情報は、同梱されている音声アーカイブ内の `AqLicence.txt` を参照してください。

ライセンスの規定により、dllファイル単体での再配布は禁止されており、それを回避するために7zファイルで配布しています。

> ■複製・再配布<br>
> ユーザーは、本ソフトウェアのパッケージを個人利用、商用利用を問わず複製、再配布<br>
> することができます。<br>
> 「ＤＬＬの再配布」の規定を除き、当社から配布されたものと異なるパッケージや部分<br>
> 的な配布はできません。<br>
> <br>
> ■ＤＬＬの再配布<br>
> ユーザーは、次のすべての条件を満たす場合に限り、ＤＬＬを他のプログラム(以下、二<br>
> 次的ソフトウェア）に組み込んで配布することができます。なお、ＤＬＬファイル単体<br>
> での再配布は許諾されておりません。<br>
> <br>
> -本使用許諾契約書ファイルの複製がＤＬＬと同じディレクトリに常に保存されているこ<br>
> と<br>
> <br>
> -ＤＬＬの著作権が当社に帰属することを、その二次的ソフトウェアのユーザーがわかる<br>
> ように明記すること<br>
> <br>
> -本ソフトウェアを使用していることを、その二次的ソフトウェアの利用者がわかるよう<br>
> に明記すること<br>

## 参考

- [AquesTalk 開発者ガイド (Linux版)](https://www.a-quest.com/archive/manual/prog_guide_linux.pdf)

## クレジット

- ゆっくり立ち絵: https://kumasannosozaiya.studio.site/
- 中国語 → koe は Love-Kogasa 氏の **zh-yukkuri.js**（aquestalk.js の中国語ラッパー）を移植したものです。ピンイン→カナは [pinyin-to-kana](https://github.com/Love-Kogasa/pinyinToKana.js)（[uiur/pinyin_to_kana](https://github.com/uiur/pinyin_to_kana) の JS 実装。対応表は [中国語音節表記ガイドライン 平凡社版](http://cn.heibonsha.co.jp/) に基づく）、漢字→ピンインは [tiny-pinyin](https://github.com/creeperyang/pinyin) を使用しています。
