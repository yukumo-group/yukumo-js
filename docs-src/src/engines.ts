import {
  AquesTalk1,
  AquesTalk2,
  AquesTalk10,
  load,
  loadAquesTalk2,
  loadAquesTalk10,
  Voice,
  AquesTalk2Voice,
  AquesTalk10Voice,
  AqtkVoice,
  AQUES_TALK10_VOICE_PRESETS,
} from "yukumo.js";
import { generateDevKey } from "./kg.ts";

export type EngineId = "aq1" | "aq2" | "aq10";
export type TalkEngine = AquesTalk1 | AquesTalk2 | AquesTalk10;
export type Aq10VoiceChoice = AquesTalk10Voice | "custom";
export type AnyVoice = Voice | AquesTalk2Voice | Aq10VoiceChoice;

export const AQ10_CUSTOM_VOICE = "custom" as const;

export const MEMORY_SIZE = 1024 * 1024 * 1024;

export const ENGINES: { id: EngineId; label: string }[] = [
  { id: "aq1", label: "AquesTalk1" },
  { id: "aq2", label: "AquesTalk2" },
  { id: "aq10", label: "AquesTalk10" },
];

export const AQ1_VOICES: Voice[] = [
  "f1",
  "f2",
  "imd1",
  "m1",
  "m2",
  "jgr",
  "dvd",
  "r1",
];

export const AQ2_VOICES: AquesTalk2Voice[] = [
  "f1c",
  "f3a",
  "f4",
  "mf1",
  "mf2",
  "m4b",
  "m5",
  "rm",
  "rm3",
  "huskey",
  "rb2",
  "rb3",
  "robo",
  "yukkuri",
];

export const AQ10_VOICES: Aq10VoiceChoice[] = [
  "f1",
  "f2",
  "f3",
  "m1",
  "m2",
  "r1",
  "r2",
  AQ10_CUSTOM_VOICE,
];

export function aq10PresetParams(voice: AquesTalk10Voice): AqtkVoice {
  return { ...AQUES_TALK10_VOICE_PRESETS[voice] };
}

export function isAq10Preset(voice: AnyVoice): voice is AquesTalk10Voice {
  return voice !== AQ10_CUSTOM_VOICE && voice in AQUES_TALK10_VOICE_PRESETS;
}

export function voicesFor(engineId: EngineId): AnyVoice[] {
  if (engineId === "aq1") return AQ1_VOICES;
  if (engineId === "aq2") return AQ2_VOICES;
  return AQ10_VOICES;
}

export function defaultVoice(engineId: EngineId): AnyVoice {
  return voicesFor(engineId)[0];
}

export async function loadTalkEngine(
  engineId: EngineId,
  voice: AnyVoice
): Promise<TalkEngine> {
  const options = { memorySize: MEMORY_SIZE };
  if (engineId === "aq1") {
    const aq1 = await load(voice as Voice, options);
    const keyResult = aq1.SetDevKey(generateDevKey({ module: "aqtk1" }));
    if (keyResult !== 0) {
      throw new Error(`SetDevKey failed with code ${keyResult}`);
    }
    return aq1;
  }
  if (engineId === "aq2") {
    return loadAquesTalk2(voice as AquesTalk2Voice, options);
  }
  const aq10Voice = isAq10Preset(voice) ? voice : "f1";
  const aq10 = await loadAquesTalk10(aq10Voice, options);
  const keyResult = aq10.SetDevKey(generateDevKey({ module: "tk10" }));
  if (keyResult !== 0) {
    throw new Error(`SetDevKey failed with code ${keyResult}`);
  }
  return aq10;
}

export function synthesize(
  engine: TalkEngine,
  engineId: EngineId,
  voice: AnyVoice,
  koe: string,
  speed: number,
  aq10Params?: AqtkVoice
): Uint8Array {
  if (engineId === "aq10") {
    const param = aq10Params ?? (isAq10Preset(voice) ? aq10PresetParams(voice) : aq10PresetParams("f1"));
    return (engine as AquesTalk10).run(koe, param.spd, param);
  }
  return engine.run(koe, speed);
}
