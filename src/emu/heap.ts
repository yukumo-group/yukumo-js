import { V86Emu } from "./v86.js";

export class Heap {
  readonly heap_addr: number;
  readonly heap_len: number;
  heap_used = 0;

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

  clear_heap(emu: V86Emu) {
    if (this.heap_used > 0) {
      emu.mem_write(this.heap_addr, new Uint8Array(this.heap_used));
      this.heap_used = 0;
    }
  }
}

export const NOP_CODE = new Uint8Array([0x90]);
