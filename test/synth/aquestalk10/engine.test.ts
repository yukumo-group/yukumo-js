import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { loadAquesTalk10, AquesTalk10 } from "../../../src/index.js";

describe("AquesTalk10 Integration", () => {
  let aq: AquesTalk10;

  beforeAll(async () => {
    aq = await loadAquesTalk10("f1", { memorySize: 1024 * 1024 * 1024 });
  }, 60000);

  afterAll(async () => {
    await aq.destroy();
  });

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

  it("should synthesize different presets without reloading the DLL", () => {
    const f1 = aq.run("\u3053\u3093\u306b\u3061\u308f", 100, "f1");
    const r2 = aq.run("\u3053\u3093\u306b\u3061\u308f", 100, "r2");

    expect(String.fromCharCode(...f1.slice(0, 4))).toBe("RIFF");
    expect(String.fromCharCode(...r2.slice(0, 4))).toBe("RIFF");
    expect(f1).not.toEqual(r2);

    const sampleRate = (wav: Uint8Array) =>
      wav[24] | (wav[25] << 8) | (wav[26] << 16) | (wav[27] << 24);
    expect(sampleRate(f1)).not.toBe(sampleRate(r2));
  }, 30000);

  it("should throw an error on invalid input", () => {
    expect(() => {
      aq.run("invalid_string_12345!@#$%");
    }).toThrow(/AquesTalk_Synthe error\. ERROR CODE: \d+/);
  }, 30000);

  describe("SetDevKey", () => {
    it("should return 0 or 1 for a dummy development key", () => {
      const result = aq.SetDevKey("dummy-dev-key");
      expect([0, 1]).toContain(result);
    }, 30000);

    it("should return 0 or 1 for an empty development key", () => {
      const result = aq.SetDevKey("");
      expect([0, 1]).toContain(result);
    }, 30000);
  });

  describe("SetUsrKey", () => {
    it("should return 0 or 1 for a dummy user key", () => {
      const result = aq.SetUsrKey("dummy-usr-key");
      expect([0, 1]).toContain(result);
    }, 30000);

    it("should return 0 or 1 for an empty user key", () => {
      const result = aq.SetUsrKey("");
      expect([0, 1]).toContain(result);
    }, 30000);
  });

  it("should still synthesize after setting license keys", () => {
    expect([0, 1]).toContain(aq.SetDevKey("dummy-dev-key"));
    expect([0, 1]).toContain(aq.SetUsrKey("dummy-usr-key"));

    const result = aq.run("\u3053\u3093\u306b\u3061\u308f");
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(44);
    const header = String.fromCharCode(...result.slice(0, 4));
    expect(header).toBe("RIFF");
  }, 30000);
});
