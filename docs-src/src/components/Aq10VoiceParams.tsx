import type { AqtkVoice } from "yukumo.js";
import { VoiceBase } from "yukumo.js";
import { useI18n } from "../i18n/I18nProvider.tsx";
import { Field } from "./Field.tsx";
import { ParamSlider } from "./ParamSlider.tsx";

export function Aq10VoiceParams({
  value,
  onChange,
}: {
  value: AqtkVoice;
  onChange: (next: AqtkVoice) => void;
}) {
  const { t } = useI18n();

  const baseOptions = [
    { id: VoiceBase.F1E, label: t.basF1e },
    { id: VoiceBase.F2E, label: t.basF2e },
    { id: VoiceBase.M1E, label: t.basM1e },
  ];

  const sliders: {
    key: Exclude<keyof AqtkVoice, "bas">;
    label: string;
    min: number;
    max: number;
  }[] = [
    { key: "spd", label: t.spd, min: 50, max: 300 },
    { key: "vol", label: t.vol, min: 0, max: 300 },
    { key: "pit", label: t.pit, min: 20, max: 200 },
    { key: "acc", label: t.acc, min: 0, max: 200 },
    { key: "lmd", label: t.lmd, min: 0, max: 200 },
    { key: "fsc", label: t.fsc, min: 50, max: 200 },
  ];

  return (
    <div style={{ textAlign: "left" }}>
      <Field>
        <label
          htmlFor="aq10-bas"
          style={{ marginRight: "0.5rem", display: "inline-block", minWidth: "5.5em" }}
        >
          {t.bas}:
        </label>
        <select
          id="aq10-bas"
          value={value.bas}
          onChange={(e) => onChange({ ...value, bas: parseInt(e.target.value) })}
        >
          {baseOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </Field>
      {sliders.map((slider) => (
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
