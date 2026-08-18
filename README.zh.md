# yukumo.js

[English](README.md) | **中文** | [日本語](README.ja.md)

在浏览器和 Node.js 中通过 WebAssembly（[v86](https://github.com/copy/v86)）运行 AquesTalk 1 / 2 / 10。

DEMO: [https://aquestalk-js.y52.dev](https://aquestalk-js.y52.dev)

## 特性

- 在浏览器 / Node.js 中通过 v86 模拟 Win32 版 AquesTalk，合成 WAV
- **AquesTalk1** 音色：`f1`, `f2`, `m1`, `m2`, `dvd`, `imd1`, `jgr`, `r1`
- **AquesTalk2** 音色（phont）：`f1c`, `f3a`, `f4`, `mf1`, `mf2`, `m4b`, `m5`, `rm`, `rm3`, `huskey`, `rb2`, `rb3`, `robo`, `yukkuri`
- **AquesTalk10** 预设：`f1`, `f2`, `f3`, `m1`, `m2`, `r1`, `r2`（或自定义 `AqtkVoice`）
- TypeScript
- 日语汉字假名混写：内置 **AqKanji2Koe**（`yukumo.js/lang/kanji2koe`）
- 普通话中文 → AquesTalk koe（假名）：`yukumo.js/lang/zh`

## 安装

```bash
npm install yukumo.js
```

## 基本用法（AquesTalk1）

`run()` 接收的是 AquesTalk 音声记号列（koe），不是普通句子。

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

AquesTalk1 与 AquesTalk10 在 DLL 导出相应函数时提供 `SetDevKey` / `SetUsrKey`。

## 日语汉字假名混写

先用 AqKanji2Koe 转成 koe，再交给 `run()`。系统词典与音色 DLL 打包在同一个 7z
中，并通过内存虚拟文件系统提供给被模拟的 DLL。

```typescript
import { load } from "yukumo.js";
import { loadAqKanji2Koe } from "yukumo.js/lang/kanji2koe";

const k2k = await loadAqKanji2Koe();
const aq = await load("f1");

const koe = k2k.convert("今日は良い天気ですね。"); // キョ'ーワ/イ'イ/テ'ンキデスネ。
const wav = aq.run(koe, 100);

await k2k.destroy();
await aq.destroy();
```

AquesTalk pico 所需的罗马字音声记号列可用 `convertRoman()` 获取。

未设置开发许可密钥时按评估版运行，ナ行 与 マ行 会全部变成 `ヌ`；在转换前调用
`setDevKey(key)` 即可解除该限制。

## 中文 → koe

从 `yukumo.js/lang/zh` 导入。这是用假名近似普通话读音，不是汉字的日语音读。

```typescript
import { load } from "yukumo.js";
import { chineseToKoe } from "yukumo.js/lang/zh";

const aq = await load("f1");
const koe = chineseToKoe("你好，世界");
const wav = aq.run(koe, 100);

await aq.destroy();
```

`chineseToKoe("你好")` → `ニーハオ`。数字会先转成中文数词（`13` → `十三` → `シーサン`）。

实现改编自 Love-Kogasa 的 **zh-yukkuri.js**（aquestalk.js 的中文适配包装）。

## API

### `load(voice, options?): Promise<AquesTalk1>`

- `voice`：`"f1" | "f2" | "m1" | "m2" | "dvd" | "imd1" | "jgr" | "r1"`
- `options.baseUrl`：资源根 URL
- `options.wasmPath`：`v86.wasm` 路径
- `options.memorySize`：模拟器内存，单位为 **字节**（默认 `1024 * 1024 * 1024`）

### `loadAquesTalk1` / `loadAquesTalk2` / `loadAquesTalk10`

可从内置 7z 或自定义归档加载。AquesTalk2 为「一个 DLL + 各音色 phont」；AquesTalk10 为单一 DLL，音色在 `run()` 时指定。

### `loadAqKanji2Koe(options?)` / `loadAqKanji2KoeFromArchive(...)`

从 `yukumo.js/lang/kanji2koe` 导入。返回的 `AqKanji2Koe` 提供 `convert(text)`、
`convertRoman(text)`、`setDevKey(key)`、`release()` 与 `destroy()`。

### `run(koe, speed?)`

返回 WAV `Uint8Array`。`speed` 为 50–300，默认 `100`。AquesTalk10 还可传入预设名或 `{ bas, spd, vol, pit, acc, lmd, fsc }`。

### `destroy(): Promise<void>`

停止模拟器并释放资源。

## 许可证

### yukumo.js

[MIT License](LICENSE)

### AquesTalk

AquesTalk 著作权属于株式会社 Aquest。请遵守 [Aquest 许可规定](https://www.a-quest.com/licence.html)。详细内容见归档内的 `AqLicence.txt`。

许可禁止单独再分发 DLL，因此本包装在 7z 中分发。

## 致谢

- 油库里立绘：https://kumasannosozaiya.studio.site/
- 中文 → koe 改编自 Love-Kogasa 的 **zh-yukkuri.js**，拼音转假名使用 [pinyin-to-kana](https://github.com/Love-Kogasa/pinyinToKana.js)（[uiur/pinyin_to_kana](https://github.com/uiur/pinyin_to_kana) 的 JS 实现；对照表依据 [中国語音節表記ガイドライン 平凡社版](http://cn.heibonsha.co.jp/)），汉字转拼音使用 [tiny-pinyin](https://github.com/creeperyang/pinyin)。
