import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { loadAquesTalk2, AquesTalk2 } from "../../../src/index.js";
import { extractFrom7z, resolveThirdsArchive } from "../../../src/assets/index.js";
import { PHONT_MAP } from "../../../src/synth/aquestalk2/voices.js";

describe("AquesTalk2 Integration", () => {
  let aq: AquesTalk2;

  beforeAll(async () => {
    aq = await loadAquesTalk2("f1c", { memorySize: 1024 * 1024 * 1024 });
  }, 60000);

  afterAll(async () => {
    await aq.destroy();
  });

  it("extracts nested phont paths from the 7z archive", async () => {
    const archive = resolveThirdsArchive();
    const phont = await extractFrom7z(archive, PHONT_MAP.f1c);
    expect(phont.byteLength).toBeGreaterThan(0);
  }, 30000);

  it("extracts nested phonts when the inner path uses backslashes", async () => {
    const archive = resolveThirdsArchive();
    const phont = await extractFrom7z(archive, "2\\phont\\aq_f1c.phont");
    expect(phont.byteLength).toBeGreaterThan(0);
  }, 30000);

  it("should synthesize speech and return a WAV file", () => {
    const result = aq.run("\u3053\u3093\u306b\u3061\u308f");

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(44);

    const header = String.fromCharCode(...result.slice(0, 4));
    expect(header).toBe("RIFF");
  }, 30000);

  it("should handle multiple calls", () => {
    const result1 = aq.run("\u3053\u3093\u306b\u3061\u308f");
    const result2 = aq.run("\u3053\u3093\u3070\u3093\u308f");

    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
    expect(result1.length).not.toBe(result2.length);
  }, 30000);

  it("should throw an error on invalid input", () => {
    expect(() => {
      aq.run("invalid_string_12345!@#$%");
    }).toThrow(/AquesTalk2_Synthe error\. ERROR CODE: \d+/);
  }, 30000);
});
