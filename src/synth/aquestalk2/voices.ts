export type Voice =
  | "f1c"
  | "f3a"
  | "huskey"
  | "m4b"
  | "mf1"
  | "rb2"
  | "rb3"
  | "rm"
  | "robo"
  | "yukkuri"
  | "f4"
  | "m5"
  | "mf2"
  | "rm3";

export const DLL_PATH = "2/AquesTalk2.dll";

export const PHONT_MAP: Record<Voice, string> = {
  f1c: "2/phont/aq_f1c.phont",
  f3a: "2/phont/aq_f3a.phont",
  huskey: "2/phont/aq_huskey.phont",
  m4b: "2/phont/aq_m4b.phont",
  mf1: "2/phont/aq_mf1.phont",
  rb2: "2/phont/aq_rb2.phont",
  rb3: "2/phont/aq_rb3.phont",
  rm: "2/phont/aq_rm.phont",
  robo: "2/phont/aq_robo.phont",
  yukkuri: "2/phont/aq_yukkuri.phont",
  f4: "2/phont/ar_f4.phont",
  m5: "2/phont/ar_m5.phont",
  mf2: "2/phont/ar_mf2.phont",
  rm3: "2/phont/ar_rm3.phont",
};
