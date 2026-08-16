import { extractFrom7z, resolveThirdsArchive, resolveWasmPath } from "../../assets/index.js";
import { V86Emu } from "../../emu/index.js";
import type { EmuOptions } from "../../emu/index.js";
import { AquesTalk2 } from "./engine.js";
import { DLL_PATH, PHONT_MAP, type Voice } from "./voices.js";

export interface Options extends EmuOptions {
  baseUrl?: string;
}

/**
 * Load AquesTalk2 by phont voice name (e.g., "f1c").
 */
export async function loadAquesTalk2(
  voice: Voice,
  options: Options = {}
) {
  const phont = PHONT_MAP[voice];
  const archivePath = resolveThirdsArchive(options.baseUrl);
  options.wasmPath = await resolveWasmPath(options.wasmPath, options.baseUrl);
  return loadAquesTalk2FromArchive(archivePath, DLL_PATH, phont, options);
}

export async function loadAquesTalk2FromArchive(
  archivePath: string,
  dllpath: string,
  phontpath: string,
  options: Options = {}
) {
  const [dllfile, phontfile] = await Promise.all([
    extractFrom7z(archivePath, dllpath),
    extractFrom7z(archivePath, phontpath),
  ]);

  const emu = new V86Emu();
  await emu.init(options);

  return new AquesTalk2(dllfile, emu, phontfile);
}
