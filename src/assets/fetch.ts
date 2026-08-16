export function isNodeRuntime(): boolean {
  const proc = (globalThis as { process?: { versions?: { node?: string } } })
    .process;
  return !!proc?.versions?.node;
}

export async function getData(url: string | URL): Promise<ArrayBuffer> {
  const urlStr = url.toString();
  if (
    isNodeRuntime() &&
    (urlStr.startsWith("file://") || !urlStr.includes("://"))
  ) {
    const fs = await import("fs/promises");
    const { fileURLToPath } = await import("url");
    const filePath = urlStr.startsWith("file://")
      ? fileURLToPath(urlStr)
      : urlStr;
    const buffer = await fs.readFile(filePath);
    return buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    );
  }
  const response = await fetch(urlStr);
  return response.arrayBuffer();
}
