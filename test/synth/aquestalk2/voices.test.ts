import { describe, it, expect } from "vitest";
import { PHONT_MAP, DLL_PATH } from "../../../src/synth/aquestalk2/voices.js";
import { loadAquesTalk2 } from "../../../src/index.js";

describe("AquesTalk2 voices", () => {
  it("maps every voice to a nested phont path under 2/phont/", () => {
    expect(DLL_PATH).toBe("2/AquesTalk2.dll");
    for (const [voice, path] of Object.entries(PHONT_MAP)) {
      expect(path).toBe(`2/phont/${path.split("/").pop()}`);
      expect(path.endsWith(".phont")).toBe(true);
      expect(path.includes("\\")).toBe(false);
      expect(voice.length).toBeGreaterThan(0);
    }
  });

  const voices = ["f1c", "yukkuri"] as const;

  for (const voice of voices) {
    it(`should synthesize speech with ${voice} phont`, async () => {
      const aq = await loadAquesTalk2(voice, {
        memorySize: 1024 * 1024 * 1024,
      });
      const result = aq.run("\u3053\u3093\u306b\u3061\u308f");

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(44);

      const header = String.fromCharCode(...result.slice(0, 4));
      expect(header).toBe("RIFF");

      await aq.destroy();
    }, 60000);
  }
});
