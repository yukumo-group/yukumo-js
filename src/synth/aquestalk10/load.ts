import { extractFrom7z, resolveThirdsArchive, resolveWasmPath } from "../../assets/index.js";
import { V86Emu } from "../../emu/index.js";
import type { EmuOptions } from "../../emu/index.js";
import { AquesTalk10 } from "./engine.js";
import { DLL_PATH, type Voice } from "./voices.js";

export interface Options extends EmuOptions {
  baseUrl?: string;
}

/**
 * Load AquesTalk10. Voice presets are applied at run() time
 * (one DLL covers f1–f3, m1–m2, r1–r2).
 */
export async function loadAquesTalk10(
  voice: Voice = "f1",
  options: Options = {}
) {
  const archivePath = resolveThirdsArchive(options.baseUrl);
  options.wasmPath = await resolveWasmPath(options.wasmPath, options.baseUrl);
  return loadAquesTalk10FromArchive(archivePath, DLL_PATH, options, voice);
}

export async function loadAquesTalk10FromArchive(
  archivePath: string,
  dllpath: string,
  options: Options = {},
  voice: Voice = "f1"
) {
  const dllfile = await extractFrom7z(archivePath, dllpath);

  const emu = new V86Emu();
  await emu.init(options);

  return new AquesTalk10(dllfile, emu, voice);
}
