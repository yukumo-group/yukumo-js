/**
 * Minimal read-only in-memory filesystem backing the Win32 file API hooks.
 * Pure data structure: it knows nothing about the emulator.
 */

export const FIRST_FILE_HANDLE = 0x0001_0000;

interface OpenFile {
  data: Uint8Array;
  position: number;
}

/** Case-insensitive, separator-insensitive path key. */
export function normalizePath(path: string): string {
  return path
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .replace(/\/$/, "")
    .toLowerCase();
}

export class VirtualFS {
  readonly #files = new Map<string, Uint8Array>();
  readonly #open = new Map<number, OpenFile>();
  #nextHandle = FIRST_FILE_HANDLE;

  addFile(path: string, data: Uint8Array): void {
    this.#files.set(normalizePath(path), data);
  }

  exists(path: string): boolean {
    return this.#files.has(normalizePath(path));
  }

  readFileByPath(path: string): Uint8Array | undefined {
    return this.#files.get(normalizePath(path));
  }

  /** @returns a handle, or `undefined` when the file does not exist. */
  open(path: string): number | undefined {
    const data = this.#files.get(normalizePath(path));
    if (!data) {
      return undefined;
    }
    const handle = this.#nextHandle++;
    this.#open.set(handle, { data, position: 0 });
    return handle;
  }

  isOpen(handle: number): boolean {
    return this.#open.has(handle);
  }

  size(handle: number): number {
    return this.#file(handle).data.length;
  }

  tell(handle: number): number {
    return this.#file(handle).position;
  }

  /** Advances the file position by the number of bytes returned. */
  read(handle: number, length: number): Uint8Array {
    const file = this.#file(handle);
    const end = Math.min(file.position + length, file.data.length);
    const chunk = file.data.subarray(file.position, end);
    file.position = end;
    return chunk;
  }

  /** @param origin 0 = begin, 1 = current, 2 = end (matches FILE_BEGIN/CURRENT/END). */
  seek(handle: number, offset: number, origin: number): number {
    const file = this.#file(handle);
    const base =
      origin === 1 ? file.position : origin === 2 ? file.data.length : 0;
    file.position = Math.max(0, Math.min(base + offset, file.data.length));
    return file.position;
  }

  close(handle: number): boolean {
    return this.#open.delete(handle);
  }

  closeAll(): void {
    this.#open.clear();
  }

  #file(handle: number): OpenFile {
    const file = this.#open.get(handle);
    if (!file) {
      throw new Error(`VirtualFS: invalid handle 0x${handle.toString(16)}`);
    }
    return file;
  }
}
