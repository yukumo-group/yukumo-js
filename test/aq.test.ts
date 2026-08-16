import { describe, it, expect, beforeAll } from "vitest";
import { load, AquesTalk1 } from "../src/index.js";

describe("AquesTalk1 Integration", () => {
  let aq: AquesTalk1;

  beforeAll(async () => {
    aq = await load("f1", { memorySize: 1024 * 1024 * 1024 });
  }, 60000);

  it("should synthesize speech and return a WAV file", () => {
    const result = aq.run("こんにちわ");

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(44); // MIN WAV header size

    // Check RIFF header
    const header = String.fromCharCode(...result.slice(0, 4));
    expect(header).toBe("RIFF");
  }, 30000);

  it("should handle multiple calls", () => {
    const result1 = aq.run("こんにちわ");
    const result2 = aq.run("こんばんわ");

    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
    expect(result1.length).not.toBe(result2.length);
  }, 30000);

  it("should throw an error on invalid input", () => {
    expect(() => {
      aq.run("invalid_string_12345!@#$%");
    }).toThrow(/AquesTalk_Synthe error\. ERROR CODE: \d+/);
  }, 30000);
});
