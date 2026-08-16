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
} from "yukumo.js";
import { generateDevKey } from "./kg.ts";

export type EngineId = "aq1" | "aq2" | "aq10";
export type TalkEngine = AquesTalk1 | AquesTalk2 | AquesTalk10;
export type AnyVoice = Voice | AquesTalk2Voice | AquesTalk10Voice;

export const MEMORY_SIZE = 1024 * 1024 * 1024;

export const ENGINES: { id: EngineId; label: string }[] = [
  { id: "aq1", label: "AquesTalk1" },
  { id: "aq2", label: "AquesTalk2" },
  { id: "aq10", label: "AquesTalk10" },
];

export const AQ1_VOICES: { id: Voice; label: string }[] = [
  { id: "f1", label: "女声1 (f1)" },
  { id: "f2", label: "女声2 (f2)" },
  { id: "imd1", label: "中性 (imd1)" },
  { id: "m1", label: "男声1 (m1)" },
  { id: "m2", label: "男声2 (m2)" },
  { id: "jgr", label: "機械1 (jgr)" },
  { id: "dvd", label: "機械2 (dvd)" },
  { id: "r1", label: "ロボット (r1)" },
];

export const AQ2_VOICES: { id: AquesTalk2Voice; label: string }[] = [
  { id: "f1c", label: "女声 (f1c)" },
  { id: "f3a", label: "女声 (f3a)" },
  { id: "f4", label: "女声 (f4)" },
  { id: "mf1", label: "中性 (mf1)" },
  { id: "mf2", label: "中性 (mf2)" },
  { id: "m4b", label: "男声 (m4b)" },
  { id: "m5", label: "男声 (m5)" },
  { id: "rm", label: "男声 (rm)" },
  { id: "rm3", label: "男声 (rm3)" },
  { id: "huskey", label: "ハスキー (huskey)" },
  { id: "rb2", label: "ロボット (rb2)" },
  { id: "rb3", label: "ロボット (rb3)" },
  { id: "robo", label: "ロボット (robo)" },
  { id: "yukkuri", label: "ゆっくり (yukkuri)" },
];

export const AQ10_VOICES: { id: AquesTalk10Voice; label: string }[] = [
  { id: "f1", label: "女声 F1 (f1)" },
  { id: "f2", label: "女声 F2 (f2)" },
  { id: "f3", label: "女声 F3 (f3)" },
  { id: "m1", label: "男声 M1 (m1)" },
  { id: "m2", label: "男声 M2 (m2)" },
  { id: "r1", label: "ロボット R1 (r1)" },
  { id: "r2", label: "ロボット R2 (r2)" },
];

export function voicesFor(engineId: EngineId) {
  if (engineId === "aq1") return AQ1_VOICES;
  if (engineId === "aq2") return AQ2_VOICES;
  return AQ10_VOICES;
}

export function defaultVoice(engineId: EngineId): AnyVoice {
  return voicesFor(engineId)[0].id;
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
  const aq10 = await loadAquesTalk10(voice as AquesTalk10Voice, options);
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
  speed: number
): Uint8Array {
  if (engineId === "aq10") {
    return (engine as AquesTalk10).run(koe, speed, voice as AquesTalk10Voice);
  }
  return engine.run(koe, speed);
}
