import { describe, it, expect } from "vitest";
import {
  DLL_PATH,
  VOICE_PRESETS,
  encodeAqtkVoice,
  resolveVoice,
} from "../../../src/synth/aquestalk10/voices.js";
import { loadAquesTalk10 } from "../../../src/index.js";

describe("AquesTalk10 voices", () => {
  it("encodes AQTK_VOICE as 7 little-endian ints", () => {
    expect(DLL_PATH).toBe("10/AquesTalk.dll");
    const bytes = encodeAqtkVoice(VOICE_PRESETS.f2);
    expect(bytes.length).toBe(28);
    const view = new DataView(bytes.buffer);
    expect(view.getInt32(0, true)).toBe(1); // F2E
    expect(view.getInt32(4, true)).toBe(100);
    expect(view.getInt32(12, true)).toBe(77);
  });

  it("overrides speed on a preset", () => {
    const voice = resolveVoice("f3", 200);
    expect(voice.spd).toBe(200);
    expect(voice.fsc).toBe(148);
    expect(VOICE_PRESETS.f3.spd).toBe(80);
  });

  const voices = ["f1", "r2"] as const;

  for (const voice of voices) {
    it(`should synthesize speech with ${voice} preset`, async () => {
      const aq = await loadAquesTalk10(voice, {
        memorySize: 1024 * 1024 * 1024,
      });
      const result = aq.run("\u3053\u3093\u306b\u3061\u308f", 100, voice);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(44);

      const header = String.fromCharCode(...result.slice(0, 4));
      expect(header).toBe("RIFF");

      await aq.destroy();
    }, 60000);
  }
});
