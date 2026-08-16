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

export async function extractFrom7z(
  archiveUrl: string,
  innerPath: string,
  password: string = THIRDS_7Z_PASSWORD
): Promise<ArrayBuffer> {
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

  return new Promise<ArrayBuffer>((resolve, reject) => {
    js7z.onAbort = (reason: unknown) => {
      reject(new Error(`js7z aborted: ${String(reason)}`));
    };
    js7z.onExit = (code: number) => {
      if (code !== 0) {
        reject(
          new Error(
            `Failed to extract ${innerPath} from 7z (exit ${code})${
              errLines.length ? `: ${errLines.join("\n")}` : ""
            }`
          )
        );
        return;
      }
      try {
        const data = readExtractedFile(js7z, innerPath);
        resolve(new Uint8Array(data).buffer);
      } catch (e) {
        reject(e);
      }
    };
    js7z.callMain([
      "x",
      "-y",
      "-bso0",
      "-bsp0",
      `-p${password}`,
      "-o/out",
      "/in/archive.7z",
      toUnixPath(innerPath),
    ]);
  });
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
