import {
  extractFrom7z,
  resolveThirdsArchive,
  resolveWasmPath,
} from "../../assets/index.js";
import { V86Emu } from "../../emu/index.js";
import type { EmuOptions } from "../../emu/index.js";
import { AqKanji2Koe } from "./engine.js";

export const DLL_PATH = "k2k/AqKanji2Koe.dll";
export const SYS_DIC_PATH = "k2k/aqdic.bin";

export interface Options extends EmuOptions {
  baseUrl?: string;
}

export async function loadAqKanji2Koe(options: Options = {}) {
  const archivePath = resolveThirdsArchive(options.baseUrl);
  options.wasmPath = await resolveWasmPath(options.wasmPath, options.baseUrl);
  return loadAqKanji2KoeFromArchive(archivePath, options);
}

export async function loadAqKanji2KoeFromArchive(
  archivePath: string,
  options: Options = {}
) {
  const [dll, sysDic] = await Promise.all([
    extractFrom7z(archivePath, DLL_PATH),
    extractFrom7z(archivePath, SYS_DIC_PATH),
  ]);

  const emu = new V86Emu();
  await emu.init(options);

  return new AqKanji2Koe(dll, new Uint8Array(sysDic), emu);
}
