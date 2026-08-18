import { describe, it, expect, beforeEach } from "vitest";
import { VirtualFS, normalizePath } from "../../src/emu/fs.js";

const CONTENT = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);

describe("normalizePath", () => {
  it("ignores separator style, casing and trailing slashes", () => {
    expect(normalizePath("C:\\AqDic\\Aqdic.BIN")).toBe("c:/aqdic/aqdic.bin");
    expect(normalizePath("C:/aqdic//aqdic.bin")).toBe("c:/aqdic/aqdic.bin");
    expect(normalizePath("C:/aqdic/")).toBe("c:/aqdic");
  });
});

describe("VirtualFS", () => {
  let fs: VirtualFS;

  beforeEach(() => {
    fs = new VirtualFS();
    fs.addFile("C:/aqdic/aqdic.bin", CONTENT);
  });

  it("finds a file however the guest spells the path", () => {
    expect(fs.exists("c:\\AQDIC\\aqdic.bin")).toBe(true);
    expect(fs.exists("C:/aqdic/missing.bin")).toBe(false);
  });

  it("returns no handle for a missing file", () => {
    expect(fs.open("C:/aqdic/missing.bin")).toBeUndefined();
  });

  it("reads sequentially and reports the size", () => {
    const handle = fs.open("C:/aqdic/aqdic.bin")!;

    expect(fs.size(handle)).toBe(8);
    expect([...fs.read(handle, 3)]).toEqual([1, 2, 3]);
    expect([...fs.read(handle, 3)]).toEqual([4, 5, 6]);
    expect(fs.tell(handle)).toBe(6);
  });

  it("clamps reads at the end of the file", () => {
    const handle = fs.open("C:/aqdic/aqdic.bin")!;

    expect(fs.read(handle, 100).length).toBe(8);
    expect(fs.read(handle, 100).length).toBe(0);
  });

  it("seeks from the begin, current and end origins", () => {
    const handle = fs.open("C:/aqdic/aqdic.bin")!;

    expect(fs.seek(handle, 4, 0)).toBe(4);
    expect(fs.seek(handle, 2, 1)).toBe(6);
    expect(fs.seek(handle, -1, 2)).toBe(7);
    expect([...fs.read(handle, 4)]).toEqual([8]);
  });

  it("clamps seeks to the file bounds", () => {
    const handle = fs.open("C:/aqdic/aqdic.bin")!;

    expect(fs.seek(handle, -100, 0)).toBe(0);
    expect(fs.seek(handle, 100, 0)).toBe(8);
  });

  it("gives each open its own position", () => {
    const first = fs.open("C:/aqdic/aqdic.bin")!;
    const second = fs.open("C:/aqdic/aqdic.bin")!;

    fs.read(first, 5);

    expect(first).not.toBe(second);
    expect(fs.tell(first)).toBe(5);
    expect(fs.tell(second)).toBe(0);
  });

  it("rejects handles that were never opened or already closed", () => {
    const handle = fs.open("C:/aqdic/aqdic.bin")!;

    expect(fs.close(handle)).toBe(true);
    expect(fs.close(handle)).toBe(false);
    expect(fs.isOpen(handle)).toBe(false);
    expect(() => fs.read(handle, 1)).toThrow(/invalid handle/);
  });
});
