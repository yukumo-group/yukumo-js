import { voicesFor, type AnyVoice, type EngineId } from "../engines.ts";
import { useI18n } from "../i18n/I18nProvider.tsx";
import { Field } from "./Field.tsx";

function voiceLabel(
  engineId: EngineId,
  voice: AnyVoice,
  voices: {
    aq1Voices: Record<string, string>;
    aq2Voices: Record<string, string>;
    aq10Voices: Record<string, string>;
  }
): string {
  const key = String(voice);
  if (engineId === "aq1") return voices.aq1Voices[key] ?? key;
  if (engineId === "aq2") return voices.aq2Voices[key] ?? key;
  return voices.aq10Voices[key] ?? key;
}

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
  const { t } = useI18n();

  return (
    <Field>
      <label htmlFor="voice-select" style={{ marginRight: "0.5rem" }}>
        {t.voice}:
      </label>
      <select
        id="voice-select"
        value={value}
        onChange={(e) => onChange(e.target.value as AnyVoice)}
        disabled={disabled}
      >
        {voicesFor(engineId).map((id) => (
          <option key={id} value={id}>
            {voiceLabel(engineId, id, t)}
          </option>
        ))}
      </select>
    </Field>
  );
}
