# yukumo.js

**English** | [中文](README.zh.md) | [日本語](README.ja.md)

AquesTalk 1 / 2 / 10 on WebAssembly ([v86](https://github.com/copy/v86)), for browsers and Node.js.

DEMO: [https://aquestalk-js.y52.dev](https://aquestalk-js.y52.dev)

## Features

- Emulates Win32 AquesTalk in the browser / Node.js and synthesizes WAV
- **AquesTalk1** voices: `f1`, `f2`, `m1`, `m2`, `dvd`, `imd1`, `jgr`, `r1`
- **AquesTalk2** voices (phont): `f1c`, `f3a`, `f4`, `mf1`, `mf2`, `m4b`, `m5`, `rm`, `rm3`, `huskey`, `rb2`, `rb3`, `robo`, `yukkuri`
- **AquesTalk10** presets: `f1`, `f2`, `f3`, `m1`, `m2`, `r1`, `r2` (or a custom `AqtkVoice`)
- TypeScript
- Japanese mixed-script text via [AqKanji2Koe-OpenJTalk-WASM](https://github.com/y52en/AqKanji2Koe-OpenJTalk-WASM) / [`kanji2koe-openjtalk`](https://www.npmjs.com/package/kanji2koe-openjtalk)
- Mandarin Chinese → AquesTalk koe (kana) via `yukumo.js/lang/zh`

## Install

```bash
npm install yukumo.js
```

## Basic usage (AquesTalk1)

`run()` takes an AquesTalk phonetic string (koe), not ordinary prose.

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

AquesTalk1 and AquesTalk10 also expose `SetDevKey` / `SetUsrKey` when the DLL exports them.

## Japanese kanji / kana text

`run()` expects koe. Convert mixed Japanese with `kanji2koe-openjtalk` first.

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

- GitHub: [AqKanji2Koe-OpenJTalk-WASM](https://github.com/y52en/AqKanji2Koe-OpenJTalk-WASM)
- npm: [`kanji2koe-openjtalk`](https://www.npmjs.com/package/kanji2koe-openjtalk)

## Mandarin Chinese → koe

Import `yukumo.js/lang/zh`. This approximates Mandarin pronunciation in katakana (not Japanese on'yomi).

```typescript
import { load } from "yukumo.js";
import { chineseToKoe } from "yukumo.js/lang/zh";

const aq = await load("f1");
const koe = chineseToKoe("你好，世界");
const wav = aq.run(koe, 100);

await aq.destroy();
```

`chineseToKoe("你好")` → `ニーハオ`. Digits are read as Chinese numerals first (`13` → `十三` → `シーサン`).

## API

### `load(voice, options?): Promise<AquesTalk1>`

- `voice`: `"f1" | "f2" | "m1" | "m2" | "dvd" | "imd1" | "jgr" | "r1"`
- `options.baseUrl`: override asset base URL
- `options.wasmPath`: path to `v86.wasm`
- `options.memorySize`: emulator memory in **bytes** (default `1024 * 1024 * 1024`)

### `loadAquesTalk1(archivePath, dllpath, options?)`

Load AquesTalk1 from a custom 7z archive and DLL path inside it.

### `loadAquesTalk2(voice, options?)` / `loadAquesTalk2FromArchive(...)`

AquesTalk2: one DLL plus a `.phont` per voice.

### `loadAquesTalk10(voice?, options?)` / `loadAquesTalk10FromArchive(...)`

AquesTalk10: one DLL; voice is applied at `run()` time.

### `run(koe, speed?)` (AQ1 / AQ2)

- `koe`: AquesTalk phonetic string
- `speed`: 50–300, default `100`
- Returns WAV `Uint8Array`

### `AquesTalk10.run(koe, speed?, voice?)`

`voice` is a preset name or `{ bas, spd, vol, pit, acc, lmd, fsc }`.

### `destroy(): Promise<void>`

Stop the emulator and free resources.

## License

### yukumo.js

[MIT License](LICENSE)

### AquesTalk

Copyright of AquesTalk belongs to Aquest Inc. Follow [Aquest's license](https://www.a-quest.com/licence.html). See `AqLicence.txt` inside the bundled voice archive.

DLLs must not be redistributed alone; this package ships them inside a 7z archive for that reason.

> Reproduction / redistribution: the full package may be copied. Partial or altered packages are not allowed, except under the DLL redistribution clause.
>
> DLL redistribution: allowed only when bundled into another program, with this license file next to the DLL, and with clear notice that Aquest owns the copyright and that AquesTalk is used. Standalone DLL redistribution is not permitted.

## References

- [AquesTalk developer guide (Linux)](https://www.a-quest.com/archive/manual/prog_guide_linux.pdf)

## Credits

- Yukkuri standing art: https://kumasannosozaiya.studio.site/
- Mandarin → koe is adapted from Love-Kogasa's **zh-yukkuri.js** (Chinese wrapper around aquestalk.js), using [pinyin-to-kana](https://github.com/Love-Kogasa/pinyinToKana.js) (JS port of [uiur/pinyin_to_kana](https://github.com/uiur/pinyin_to_kana); mapping based on [中国語音節表記ガイドライン 平凡社版](http://cn.heibonsha.co.jp/)) and [tiny-pinyin](https://github.com/creeperyang/pinyin).
