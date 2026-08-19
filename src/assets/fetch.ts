export function isNodeRuntime(): boolean {
  const proc = (globalThis as { process?: { versions?: { node?: string } } })
    .process;
  return !!proc?.versions?.node;
}

const dataCache = new Map<string, Promise<ArrayBuffer>>();

export async function getData(url: string | URL): Promise<ArrayBuffer> {
  const urlStr = url.toString();
  const cached = dataCache.get(urlStr);
  if (cached) {
    return cached;
  }
  const pending = readData(urlStr);
  dataCache.set(urlStr, pending);
  pending.catch(() => {
    if (dataCache.get(urlStr) === pending) {
      dataCache.delete(urlStr);
    }
  });
  return pending;
}

async function readData(urlStr: string): Promise<ArrayBuffer> {
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
