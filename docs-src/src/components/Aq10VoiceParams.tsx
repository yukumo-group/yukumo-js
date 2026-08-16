import type { AqtkVoice } from "yukumo.js";
import { VoiceBase } from "yukumo.js";
import { Field } from "./Field.tsx";
import { ParamSlider } from "./ParamSlider.tsx";

const BASE_OPTIONS: { id: number; label: string }[] = [
  { id: VoiceBase.F1E, label: "F1E (女声)" },
  { id: VoiceBase.F2E, label: "F2E (女声)" },
  { id: VoiceBase.M1E, label: "M1E (男声)" },
];

const SLIDERS: {
  key: Exclude<keyof AqtkVoice, "bas">;
  label: string;
  min: number;
  max: number;
}[] = [
  { key: "spd", label: "話速", min: 50, max: 300 },
  { key: "vol", label: "音量", min: 0, max: 300 },
  { key: "pit", label: "高さ", min: 20, max: 200 },
  { key: "acc", label: "アクセント", min: 0, max: 200 },
  { key: "lmd", label: "音程１", min: 0, max: 200 },
  { key: "fsc", label: "音程２", min: 50, max: 200 },
];

export function Aq10VoiceParams({
  value,
  onChange,
}: {
  value: AqtkVoice;
  onChange: (next: AqtkVoice) => void;
}) {
  return (
    <div style={{ textAlign: "left" }}>
      <Field>
        <label htmlFor="aq10-bas" style={{ marginRight: "0.5rem", display: "inline-block", minWidth: "5.5em" }}>
          基本素片:
        </label>
        <select
          id="aq10-bas"
          value={value.bas}
          onChange={(e) => onChange({ ...value, bas: parseInt(e.target.value) })}
        >
          {BASE_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </Field>
      {SLIDERS.map((slider) => (
        <ParamSlider
          key={slider.key}
          id={`aq10-${slider.key}`}
          label={slider.label}
          min={slider.min}
          max={slider.max}
          value={value[slider.key]}
          onChange={(next) => onChange({ ...value, [slider.key]: next })}
        />
      ))}
    </div>
  );
}
