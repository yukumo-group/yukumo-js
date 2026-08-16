const TABLE = new Uint8Array([7, 2, 4, 0, 1, 5, 3, 6]);
const XOR = 0xd271ba9df61eed07n;
const ROUNDS = 0x56f;

const DEV_PRODUCT = 0x5856;
const USR_PRODUCT = 0x0517;

const DEV_MODULES = {
  aqtk1: [0x6e, 0x14],
  k2k: [0xc8, 0x29],
  tk10: [0x64, 0x0a],
} as const;

const USR_MODULES = {
  aqtk1: [0x6e, 0x14],
  tk10: [0x64, 0x0a],
} as const;

export type DevModule = keyof typeof DEV_MODULES;
export type UsrModule = keyof typeof USR_MODULES;

function signedChar(x: number): number {
  x &= 0xff;
  return x < 128 ? x : x - 256;
}

export function encryptLicenseKey(plain: bigint): bigint {
  let v1 = plain & 0xffffffffffffffffn;
  for (let i = ROUNDS - 1; i >= 0; i--) {
    const low = Number(v1 & 7n);
    const v3 = (low + signedChar(i) + 2) & 7;
    const top = BigInt(TABLE[v3]);
    v1 = ((v1 >> 3n) | (top << 61n)) & 0xffffffffffffffffn;
  }
  return v1 ^ XOR;
}

export function formatKey(value: bigint, groups = 4): string {
  const hex16 = (value & 0xffffffffffffffffn)
    .toString(16)
    .toUpperCase()
    .padStart(16, "0");
  if (groups <= 0) {
    return hex16;
  }
  const size = Math.floor(16 / groups);
  const parts: string[] = [];
  for (let i = 0; i < 16; i += size) {
    parts.push(hex16.slice(i, i + size));
  }
  return parts.join("-");
}

function daysNow(): number {
  return Math.floor(Date.now() / 1000 / 86400);
}

export function generateDevKey(options: {
  module?: DevModule;
  product?: number;
  version?: number;
  dashed?: boolean;
  mid?: number;
  plainText: true;
}): bigint;
export function generateDevKey(options?: {
  module?: DevModule;
  product?: number;
  version?: number;
  dashed?: boolean;
  mid?: number;
  plainText?: false;
}): string;
export function generateDevKey({
  module = "aqtk1",
  product = DEV_PRODUCT,
  version,
  dashed = true,
  mid = 0,
  plainText = false,
}: {
  module?: DevModule;
  product?: number;
  version?: number;
  dashed?: boolean;
  mid?: number;
  plainText?: boolean;
} = {}): string | bigint {
  const pair = DEV_MODULES[module];
  if (!pair) {
    throw new Error(
      `unknown module ${JSON.stringify(module)}; expected one of ${Object.keys(DEV_MODULES).sort().join(", ")}`
    );
  }
  const [kind, versionMin] = pair;
  const ver = version ?? versionMin;
  if (!(versionMin <= ver && ver <= 0xff)) {
    throw new Error(
      `version (BYTE1) must be in 0x${versionMin.toString(16).toUpperCase().padStart(2, "0")}..0xFF`
    );
  }
  product &= 0xffff;
  if ((product & 0xff) !== 0x56) {
    throw new Error("product low byte must be 0x56 ('V') for SetDevKey");
  }
  const plain =
    BigInt(kind) |
    (BigInt(ver & 0xff) << 8n) |
    (BigInt(mid >>> 0) << 16n) |
    (BigInt(product) << 48n);
  if (plainText) {
    return plain;
  }
  return formatKey(encryptLicenseKey(plain), dashed ? 4 : 0);
}

export function generateUsrKey(options: {
  module?: UsrModule;
  version?: number;
  usrData?: number;
  days?: number;
  timeLimited?: boolean;
  product?: number;
  dashed?: boolean;
  plainText: true;
}): bigint;
export function generateUsrKey(options?: {
  module?: UsrModule;
  version?: number;
  usrData?: number;
  days?: number;
  timeLimited?: boolean;
  product?: number;
  dashed?: boolean;
  plainText?: false;
}): string;
export function generateUsrKey({
  module = "aqtk1",
  version,
  usrData = 0x0fff,
  days,
  timeLimited = false,
  product = USR_PRODUCT,
  dashed = true,
  plainText = false,
}: {
  module?: UsrModule;
  version?: number;
  usrData?: number;
  days?: number;
  timeLimited?: boolean;
  product?: number;
  dashed?: boolean;
  plainText?: boolean;
} = {}): string | bigint {
  const pair = USR_MODULES[module];
  if (!pair) {
    throw new Error(
      `unknown module ${JSON.stringify(module)}; expected one of ${Object.keys(USR_MODULES).sort().join(", ")}`
    );
  }
  let kind: number = pair[0];
  const versionMin = pair[1];
  const ver = version ?? versionMin;
  if (!(versionMin <= ver && ver <= 0xff)) {
    throw new Error(
      `version (BYTE1) must be in 0x${versionMin.toString(16).toUpperCase().padStart(2, "0")}..0xFF`
    );
  }
  product &= 0xffff;
  if ((product & 0xff) !== 0x17) {
    throw new Error("product low byte must be 0x17 for SetUsrKey");
  }
  usrData &= 0xffff;
  let day: number;
  if (timeLimited) {
    kind = 0xff;
    day = days === undefined ? daysNow() : days & 0xffff;
  } else {
    day = days === undefined ? 0 : days & 0xffff;
  }
  const plain =
    BigInt(kind) |
    (BigInt(ver & 0xff) << 8n) |
    (BigInt(day) << 16n) |
    (BigInt(usrData) << 32n) |
    (BigInt(product) << 48n);
  if (plainText) {
    return plain;
  }
  return formatKey(encryptLicenseKey(plain), dashed ? 4 : 0);
}
