export const VoiceBase = {
  F1E: 0,
  F2E: 1,
  M1E: 2,
} as const;

export type VoiceBaseId = (typeof VoiceBase)[keyof typeof VoiceBase];

export type Voice = "f1" | "f2" | "f3" | "m1" | "m2" | "r1" | "r2";

export interface AqtkVoice {
  bas: number;
  spd: number;
  vol: number;
  pit: number;
  acc: number;
  lmd: number;
  fsc: number;
}

export const DLL_PATH = "10/AquesTalk.dll";

export const VOICE_PRESETS: Record<Voice, AqtkVoice> = {
  f1: { bas: VoiceBase.F1E, spd: 100, vol: 100, pit: 100, acc: 100, lmd: 100, fsc: 100 },
  f2: { bas: VoiceBase.F2E, spd: 100, vol: 100, pit: 77, acc: 150, lmd: 100, fsc: 100 },
  f3: { bas: VoiceBase.F1E, spd: 80, vol: 100, pit: 100, acc: 100, lmd: 61, fsc: 148 },
  m1: { bas: VoiceBase.M1E, spd: 100, vol: 100, pit: 30, acc: 100, lmd: 100, fsc: 100 },
  m2: { bas: VoiceBase.M1E, spd: 105, vol: 100, pit: 45, acc: 130, lmd: 120, fsc: 100 },
  r1: { bas: VoiceBase.M1E, spd: 100, vol: 100, pit: 30, acc: 20, lmd: 190, fsc: 100 },
  r2: { bas: VoiceBase.F2E, spd: 70, vol: 100, pit: 50, acc: 50, lmd: 50, fsc: 180 },
};

export function resolveVoice(
  voice: Voice | AqtkVoice,
  speed?: number
): AqtkVoice {
  const base =
    typeof voice === "string"
      ? VOICE_PRESETS[voice]
      : voice;
  if (base == null) {
    throw new Error(`Unknown AquesTalk10 voice '${String(voice)}'`);
  }
  if (speed === undefined) {
    return { ...base };
  }
  return { ...base, spd: speed };
}

export function encodeAqtkVoice(voice: AqtkVoice): Uint8Array {
  const fields = [
    voice.bas,
    voice.spd,
    voice.vol,
    voice.pit,
    voice.acc,
    voice.lmd,
    voice.fsc,
  ];
  const out = new Uint8Array(fields.length * 4);
  const view = new DataView(out.buffer);
  for (let i = 0; i < fields.length; i++) {
    view.setInt32(i * 4, fields[i], true);
  }
  return out;
}
