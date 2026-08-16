import { extractFrom7z, resolveThirdsArchive, resolveWasmPath } from "../../assets/index.js";
import { V86Emu } from "../../emu/index.js";
import type { EmuOptions } from "../../emu/index.js";
import { AquesTalk1 } from "./engine.js";
import { VOICE_MAP, type Voice } from "./voices.js";

export interface Options extends EmuOptions {
  baseUrl?: string;
}

/**
 * Load AquesTalk1 by voice name (e.g., "f1").
 */
export async function load(
  voice: Voice,
  options: Options = {}
) {
  const dll = VOICE_MAP[voice];
  const archivePath = resolveThirdsArchive(options.baseUrl);
  options.wasmPath = await resolveWasmPath(options.wasmPath, options.baseUrl);
  return loadAquesTalk1(archivePath, dll, options);
}

export async function loadAquesTalk1(
  archivePath: string,
  dllpath: string,
  options: Options = {}
) {
  const dllfile = await extractFrom7z(archivePath, dllpath);

  const emu = new V86Emu();
  await emu.init(options);

  return new AquesTalk1(dllfile, emu);
}
