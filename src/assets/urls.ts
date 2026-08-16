import { isNodeRuntime } from "./fetch.js";

export const THIRDS_7Z_URL = new URL("../../bin/thirds.7z", import.meta.url);
export const WASM_URL = new URL("../../bin/v86.wasm", import.meta.url);
export const THIRDS_7Z_PASSWORD = "zgrnf";

export function resolveThirdsArchive(baseUrl?: string): string {
  return baseUrl
    ? new URL("thirds.7z", baseUrl).href
    : THIRDS_7Z_URL.href;
}

export async function resolveWasmPath(
  wasmPath?: string,
  baseUrl?: string
): Promise<string> {
  let resolved =
    wasmPath ??
    (baseUrl ? new URL("v86.wasm", baseUrl).href : WASM_URL.href);

  if (isNodeRuntime() && resolved.startsWith("file://")) {
    const { fileURLToPath } = await import("url");
    resolved = fileURLToPath(resolved);
  }

  return resolved;
}
