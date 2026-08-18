import { describe, it, expect, beforeEach } from "vitest";
import { Heap } from "../../src/emu/heap.js";
import type { V86Emu } from "../../src/emu/index.js";

const HEAP_ADDRESS = 0x1000;
const HEAP_LENGTH = 0x1000;

/** Just enough of the emulator for the Heap: a flat block of guest memory. */
function fakeEmu() {
  const memory = new Uint8Array(HEAP_ADDRESS + HEAP_LENGTH);
  return {
    memory,
    emu: {
      mem_write: (address: number, data: Uint8Array) =>
        memory.set(data, address),
      mem_read: (address: number, length: number) =>
        memory.slice(address, address + length),
    } as unknown as V86Emu,
  };
}

describe("Heap", () => {
  let emu: V86Emu;
  let memory: Uint8Array;
  let heap: Heap;

  beforeEach(() => {
    ({ emu, memory } = fakeEmu());
    heap = new Heap(emu, HEAP_ADDRESS, HEAP_LENGTH);
  });

  it("hands out distinct 4-byte aligned blocks", () => {
    const first = heap.allocate(emu, 3);
    const second = heap.allocate(emu, 3);

    expect(first % 4).toBe(0);
    expect(second % 4).toBe(0);
    expect(second).toBeGreaterThanOrEqual(first + 3);
  });

  it("remembers the requested size", () => {
    expect(heap.size_of(heap.allocate(emu, 40))).toBe(40);
    expect(heap.size_of(0xdeadbeef)).toBe(0);
  });

  it("reuses a released block of the same size", () => {
    const address = heap.allocate(emu, 32);
    heap.release(address);

    expect(heap.allocate(emu, 32)).toBe(address);
  });

  it("does not reuse a released block for a different size", () => {
    const address = heap.allocate(emu, 32);
    heap.release(address);

    expect(heap.allocate(emu, 64)).not.toBe(address);
  });

  it("zeroes a recycled block", () => {
    const address = heap.allocate(emu, 8);
    emu.mem_write(address, new Uint8Array(8).fill(0xff));
    heap.release(address);

    const reused = heap.allocate(emu, 8);

    expect([...memory.slice(reused, reused + 8)]).toEqual(Array(8).fill(0));
  });

  it("ignores a double free so a block is never handed out twice", () => {
    const address = heap.allocate(emu, 16);

    expect(heap.release(address)).toBe(true);
    expect(heap.release(address)).toBe(false);
    expect(heap.allocate(emu, 16)).toBe(address);
    expect(heap.allocate(emu, 16)).not.toBe(address);
  });

  it("stops repeated alloc/free from growing the heap", () => {
    heap.release(heap.allocate(emu, 64));
    const used = heap.heap_used;

    for (let i = 0; i < 100; i++) {
      heap.release(heap.allocate(emu, 64));
    }

    expect(heap.heap_used).toBe(used);
  });

  it("throws instead of writing past the end of the heap", () => {
    expect(() => heap.allocate(emu, HEAP_LENGTH + 1)).toThrow("heap over");
  });

  it("forgets every block after clear_heap", () => {
    const address = heap.allocate(emu, 16);
    heap.clear_heap(emu);

    expect(heap.heap_used).toBe(0);
    expect(heap.size_of(address)).toBe(0);
    expect(heap.release(address)).toBe(false);
  });
});
