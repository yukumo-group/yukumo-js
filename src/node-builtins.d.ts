declare module "url" {
  export function fileURLToPath(url: string | URL): string;
}

declare module "fs/promises" {
  export function readFile(
    path: string
  ): Promise<{
    buffer: ArrayBuffer;
    byteOffset: number;
    byteLength: number;
  }>;
}
