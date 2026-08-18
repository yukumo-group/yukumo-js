/**
 * Heap APIs backed by a {@link Heap}, including working `free` and `realloc`.
 * The heap handle argument is ignored; there is only one guest heap.
 */

import { V86Emu, REG_EAX } from "../v86.js";
import { reg_write_uint32 } from "../helpers.js";
import { get_arg, ret, ret_n } from "../x86.js";
import type { Heap } from "../heap.js";

type Hook = (emu: V86Emu) => void;

function complete(emu: V86Emu, result: number, stackBytes: number) {
  reg_write_uint32(emu, REG_EAX, result);
  ret_n(emu, stackBytes);
}

export function heapAlloc_hook(heap: Heap): Hook {
  return (emu) => {
    complete(emu, heap.allocate(emu, get_arg(emu, 2)), 12);
  };
}

export function heapFree_hook(heap: Heap): Hook {
  return (emu) => {
    heap.release(get_arg(emu, 2));
    complete(emu, 1, 12);
  };
}

export function heapReAlloc_hook(heap: Heap): Hook {
  return (emu) => {
    const previous = get_arg(emu, 2);
    const size = get_arg(emu, 3);

    const address = heap.allocate(emu, size);
    const carried = Math.min(heap.size_of(previous), size);
    if (carried > 0) {
      emu.mem_write(address, emu.mem_read(previous, carried));
    }
    heap.release(previous);

    complete(emu, address, 16);
  };
}

export function heapSize_hook(heap: Heap): Hook {
  return (emu) => {
    complete(emu, heap.size_of(get_arg(emu, 2)), 12);
  };
}

export function malloc_hook(heap: Heap): Hook {
  return (emu) => {
    reg_write_uint32(emu, REG_EAX, heap.allocate(emu, get_arg(emu, 0)));
    ret(emu);
  };
}

export function free_hook(heap: Heap): Hook {
  return (emu) => {
    heap.release(get_arg(emu, 0));
    ret(emu);
  };
}
