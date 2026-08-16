import { voicesFor, type AnyVoice, type EngineId } from "../engines.ts";
import { Field } from "./Field.tsx";

export function VoiceSelect({
  engineId,
  value,
  disabled,
  onChange,
}: {
  engineId: EngineId;
  value: AnyVoice;
  disabled: boolean;
  onChange: (voice: AnyVoice) => void;
}) {
  return (
    <Field>
      <label htmlFor="voice-select" style={{ marginRight: "0.5rem" }}>
        Voice:
      </label>
      <select
        id="voice-select"
        value={value}
        onChange={(e) => onChange(e.target.value as AnyVoice)}
        disabled={disabled}
      >
        {voicesFor(engineId).map((v) => (
          <option key={v.id} value={v.id}>
            {v.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
