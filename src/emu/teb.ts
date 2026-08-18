/**
 * Thread Environment Block, the structure Win32 code reaches through `fs:[0]`.
 * Only the handful of fields MSVC-generated code touches are populated.
 */

import { V86Emu } from "./v86.js";
import { Heap } from "./heap.js";
import { to_bytes_uint32 } from "./bytes.js";

const TEB_SIZE = 0x1000;
const PEB_SIZE = 0x1000;

const EXCEPTION_LIST = 0x00;
const STACK_BASE = 0x04;
const STACK_LIMIT = 0x08;
const SELF = 0x18;
const PEB_POINTER = 0x30;

/** End-of-chain marker for the SEH linked list. */
const END_OF_EXCEPTION_LIST = 0xffff_ffff;

export function installTeb(
  emu: V86Emu,
  heap: Heap,
  stackTop: number,
  stackLimit: number
): number {
  const peb = heap.set_mem_value(emu, new Uint8Array(PEB_SIZE));
  const teb = heap.set_mem_value(emu, new Uint8Array(TEB_SIZE));

  const write = (offset: number, value: number) =>
    emu.mem_write(teb + offset, to_bytes_uint32(value));

  write(EXCEPTION_LIST, END_OF_EXCEPTION_LIST);
  write(STACK_BASE, stackTop);
  write(STACK_LIMIT, stackLimit);
  write(SELF, teb);
  write(PEB_POINTER, peb);

  emu.set_fs_base(teb);
  return teb;
}
