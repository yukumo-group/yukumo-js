import { describe, it, expect } from "vitest";
import { load } from "../../../src/index.js";

describe("AquesTalk1 Multi-Voice Support", () => {
  const voices = ["f1", "f2"] as const;

  for (const voice of voices) {
    it(`should synthesize speech with ${voice} voice`, async () => {
      const aq = await load(voice, { memorySize: 1024 * 1024 * 1024 });
      const result = aq.run("\u3053\u3093\u306b\u3061\u308f");

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(44); // MIN WAV header size

      // Check RIFF header
      const header = String.fromCharCode(...result.slice(0, 4));
      expect(header).toBe("RIFF");

      await aq.destroy();
    }, 60000);
  }
});
