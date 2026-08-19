import JS7zModule from "js7z-tools";
import { getData } from "./fetch.js";
import { THIRDS_7Z_PASSWORD } from "./urls.js";

type JS7zInstance = {
  FS: {
    mkdir: (path: string) => void;
    writeFile: (path: string, data: Uint8Array) => void;
    readFile: (path: string, opts?: { encoding?: string }) => Uint8Array;
  };
  callMain: (args: string[]) => void;
  onExit?: (code: number) => void;
  onAbort?: (reason: unknown) => void;
};

const JS7z = JS7zModule as unknown as (options?: {
  print?: (text: string) => void;
  printErr?: (text: string) => void;
}) => Promise<JS7zInstance>;

type Waiter = {
  unixPath: string;
  resolve: (buf: ArrayBuffer) => void;
  reject: (err: unknown) => void;
};

const extractCache = new Map<string, Promise<ArrayBuffer>>();
const pendingByArchive = new Map<string, Waiter[]>();
const batchRunning = new Map<string, Promise<void>>();

function extractCacheKey(
  archiveUrl: string,
  unixPath: string,
  password: string
): string {
  return `${archiveUrl}\0${password}\0${unixPath}`;
}

function archiveKey(archiveUrl: string, password: string): string {
  return `${archiveUrl}\0${password}`;
}

/**
 * Extract a file from a 7z archive. Concurrent calls for the same archive
 * share one fetch and one js7z run; extracted files are cached.
 */
export function extractFrom7z(
  archiveUrl: string,
  innerPath: string,
  password: string = THIRDS_7Z_PASSWORD
): Promise<ArrayBuffer> {
  const unixPath = toUnixPath(innerPath);
  const cacheKey = extractCacheKey(archiveUrl, unixPath, password);
  const cached = extractCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const pending = new Promise<ArrayBuffer>((resolve, reject) => {
    const aKey = archiveKey(archiveUrl, password);
    let waiters = pendingByArchive.get(aKey);
    if (!waiters) {
      waiters = [];
      pendingByArchive.set(aKey, waiters);
    }
    waiters.push({ unixPath, resolve, reject });
    scheduleBatch(archiveUrl, password);
  });
  extractCache.set(cacheKey, pending);
  pending.catch(() => {
    if (extractCache.get(cacheKey) === pending) {
      extractCache.delete(cacheKey);
    }
  });
  return pending;
}

function scheduleBatch(archiveUrl: string, password: string): void {
  const aKey = archiveKey(archiveUrl, password);
  const existing = batchRunning.get(aKey);
  if (existing) {
    existing.finally(() => {
      if (pendingByArchive.get(aKey)?.length) {
        scheduleBatch(archiveUrl, password);
      }
    });
    return;
  }
  const job = runBatch(archiveUrl, password).finally(() => {
    if (batchRunning.get(aKey) === job) {
      batchRunning.delete(aKey);
    }
  });
  batchRunning.set(aKey, job);
}

async function runBatch(archiveUrl: string, password: string): Promise<void> {
  await Promise.resolve();
  const aKey = archiveKey(archiveUrl, password);
  const waiters = pendingByArchive.get(aKey) ?? [];
  pendingByArchive.delete(aKey);
  if (waiters.length === 0) {
    return;
  }

  const uniquePaths = [...new Set(waiters.map((w) => w.unixPath))];
  try {
    const { files, errors } = await extractManyUncached(
      archiveUrl,
      uniquePaths,
      password
    );
    for (const waiter of waiters) {
      const buf = files.get(waiter.unixPath);
      if (buf) {
        waiter.resolve(buf);
      } else {
        waiter.reject(
          errors.get(waiter.unixPath) ??
            new Error(`Failed to read extracted file: ${waiter.unixPath}`)
        );
      }
    }
  } catch (e) {
    for (const waiter of waiters) {
      waiter.reject(e);
    }
  }
}

async function extractManyUncached(
  archiveUrl: string,
  innerPaths: string[],
  password: string
): Promise<{
  files: Map<string, ArrayBuffer>;
  errors: Map<string, unknown>;
}> {
  const archive = new Uint8Array(await getData(archiveUrl));
  const errLines: string[] = [];
  const js7z = await JS7z({
    print: () => {},
    printErr: (text: string) => {
      errLines.push(text);
    },
  });

  js7z.FS.mkdir("/in");
  js7z.FS.writeFile("/in/archive.7z", archive);

  const exitCode = await new Promise<number>((resolve, reject) => {
    js7z.onAbort = (reason: unknown) => {
      reject(new Error(`js7z aborted: ${String(reason)}`));
    };
    js7z.onExit = (code: number) => {
      resolve(code);
    };
    js7z.callMain([
      "x",
      "-y",
      "-bso0",
      "-bsp0",
      `-p${password}`,
      "-o/out",
      "/in/archive.7z",
      ...innerPaths,
    ]);
  });

  const files = new Map<string, ArrayBuffer>();
  const errors = new Map<string, unknown>();
  for (const innerPath of innerPaths) {
    try {
      const data = readExtractedFile(js7z, innerPath);
      files.set(innerPath, new Uint8Array(data).buffer);
    } catch (e) {
      errors.set(innerPath, e);
    }
  }
  if (files.size === 0) {
    const detail = errLines.length ? `: ${errLines.join("\n")}` : "";
    throw new Error(
      `Failed to extract from 7z (exit ${exitCode})${detail}`
    );
  }
  return { files, errors };
}

function toUnixPath(path: string): string {
  return path.replace(/\\/g, "/");
}

/**
 * js7z MEMFS may store extracted nested paths with `/` or `\`.
 * Try both, then the basename under `/out`, so phonts like
 * `2/phont/aq_f1c.phont` remain readable across hosts.
 */
function readExtractedFile(js7z: JS7zInstance, innerPath: string): Uint8Array {
  const unix = toUnixPath(innerPath);
  const win = unix.replace(/\//g, "\\");
  const base = unix.split("/").pop() ?? unix;
  const candidates = [`/out/${unix}`, `/out/${win}`, `/out/${base}`];
  let lastErr: unknown;
  for (const candidate of candidates) {
    try {
      return js7z.FS.readFile(candidate);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error(`Failed to read extracted file: ${innerPath}`);
}
