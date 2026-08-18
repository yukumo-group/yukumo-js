/**
 * Win32 file API hooks backed by a {@link VirtualFS}.
 * Only the read-only subset the CRT needs to open and read a file is covered.
 */

import { V86Emu, REG_EAX } from "../v86.js";
import { reg_write_uint32, read_wide_string } from "../helpers.js";
import { get_arg, ret_n } from "../x86.js";
import { to_bytes_uint32 } from "../bytes.js";
import type { VirtualFS } from "../fs.js";

const INVALID_HANDLE_VALUE = 0xffff_ffff;
const FILE_TYPE_DISK = 0x0001;
const BY_HANDLE_FILE_INFORMATION_SIZE = 52;

type Hook = (emu: V86Emu) => void;

function complete(emu: V86Emu, result: number, stackBytes: number) {
  reg_write_uint32(emu, REG_EAX, result);
  ret_n(emu, stackBytes);
}

export function createFileW_hook(fs: VirtualFS): Hook {
  return (emu) => {
    const path = read_wide_string(emu, get_arg(emu, 0));
    const handle = fs.open(path);
    complete(emu, handle ?? INVALID_HANDLE_VALUE, 28);
  };
}

export function readFile_hook(fs: VirtualFS): Hook {
  return (emu) => {
    const handle = get_arg(emu, 0);
    const buffer = get_arg(emu, 1);
    const length = get_arg(emu, 2);
    const bytesReadPtr = get_arg(emu, 3);

    if (!fs.isOpen(handle)) {
      complete(emu, 0, 20);
      return;
    }

    const chunk = fs.read(handle, length);
    if (chunk.length > 0) {
      emu.mem_write(buffer, chunk);
    }
    if (bytesReadPtr) {
      emu.mem_write(bytesReadPtr, to_bytes_uint32(chunk.length));
    }
    complete(emu, 1, 20);
  };
}

export function getFileSizeEx_hook(fs: VirtualFS): Hook {
  return (emu) => {
    const handle = get_arg(emu, 0);
    const sizePtr = get_arg(emu, 1);

    if (!fs.isOpen(handle)) {
      complete(emu, 0, 8);
      return;
    }

    emu.mem_write(sizePtr, to_bytes_uint32(fs.size(handle)));
    emu.mem_write(sizePtr + 4, to_bytes_uint32(0));
    complete(emu, 1, 8);
  };
}

export function setFilePointerEx_hook(fs: VirtualFS): Hook {
  return (emu) => {
    const handle = get_arg(emu, 0);
    // LARGE_INTEGER is passed by value: low dword then high dword.
    const distance = get_arg(emu, 1) | 0;
    const newPositionPtr = get_arg(emu, 3);
    const moveMethod = get_arg(emu, 4);

    if (!fs.isOpen(handle)) {
      complete(emu, 0, 20);
      return;
    }

    const position = fs.seek(handle, distance, moveMethod);
    if (newPositionPtr) {
      emu.mem_write(newPositionPtr, to_bytes_uint32(position));
      emu.mem_write(newPositionPtr + 4, to_bytes_uint32(0));
    }
    complete(emu, 1, 20);
  };
}

export function getFileType_hook(fs: VirtualFS): Hook {
  return (emu) => {
    complete(emu, fs.isOpen(get_arg(emu, 0)) ? FILE_TYPE_DISK : 0, 4);
  };
}

export function getFileInformationByHandle_hook(fs: VirtualFS): Hook {
  return (emu) => {
    const handle = get_arg(emu, 0);
    const infoPtr = get_arg(emu, 1);

    if (!fs.isOpen(handle)) {
      complete(emu, 0, 8);
      return;
    }

    const info = new Uint8Array(BY_HANDLE_FILE_INFORMATION_SIZE);
    info.set(to_bytes_uint32(fs.size(handle)), 36); // nFileSizeLow
    info.set(to_bytes_uint32(1), 40); // nNumberOfLinks
    emu.mem_write(infoPtr, info);
    complete(emu, 1, 8);
  };
}

export function closeHandle_hook(fs: VirtualFS): Hook {
  return (emu) => {
    complete(emu, fs.close(get_arg(emu, 0)) ? 1 : 0, 4);
  };
}
