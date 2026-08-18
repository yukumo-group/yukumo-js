import { V86Emu } from "./v86.js";

export class Heap {
  readonly heap_addr: number;
  readonly heap_len: number;
  heap_used = 0;

  readonly #sizes = new Map<number, number>();
  readonly #free = new Map<number, number[]>();
  readonly #live = new Set<number>();

  constructor(emu: V86Emu, heap_addr: number, heap_len = 0) {
    this.heap_addr = heap_addr;
    this.heap_len = heap_len;
    // v86 has flat physical memory, no need to explicitly map
    // Just zero-fill the heap region
    emu.mem_write(heap_addr, new Uint8Array(heap_len));
  }

  set_mem_value(emu: V86Emu, value: Uint8Array): number {
    // Aligh to 4 bytes
    this.heap_used = (this.heap_used + 3) & ~3;
    const write_address = this.heap_addr + this.heap_used;
    if (write_address + value.length >= this.heap_addr + this.heap_len) {
      throw new Error("heap over");
    }
    emu.mem_write(write_address, value);
    this.heap_used += value.length;
    return write_address;
  }

  /**
   * Allocate a zeroed block that can later be handed back with
   * {@link release}. Freed blocks are only reused for a request of exactly the
   * same size, which keeps the bookkeeping trivial while still recycling the
   * repeated allocations a guest makes on each call.
   */
  allocate(emu: V86Emu, size: number): number {
    const wanted = Math.max(1, size);
    const recycled = this.#free.get(wanted)?.pop();
    if (recycled !== undefined) {
      emu.mem_write(recycled, new Uint8Array(wanted));
      this.#live.add(recycled);
      return recycled;
    }

    const address = this.set_mem_value(emu, new Uint8Array(wanted));
    this.#sizes.set(address, wanted);
    this.#live.add(address);
    return address;
  }

  release(address: number): boolean {
    const size = this.#sizes.get(address);
    if (size === undefined || !this.#live.delete(address)) {
      return false;
    }
    const bucket = this.#free.get(size);
    if (bucket) {
      bucket.push(address);
    } else {
      this.#free.set(size, [address]);
    }
    return true;
  }

  /** Size of a block from {@link allocate}, or 0 if it is not one. */
  size_of(address: number): number {
    return this.#sizes.get(address) ?? 0;
  }

  clear_heap(emu: V86Emu) {
    this.#sizes.clear();
    this.#free.clear();
    this.#live.clear();
    if (this.heap_used > 0) {
      emu.mem_write(this.heap_addr, new Uint8Array(this.heap_used));
      this.heap_used = 0;
    }
  }
}

export const NOP_CODE = new Uint8Array([0x90]);
