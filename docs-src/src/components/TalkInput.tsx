import { useI18n } from "../i18n/I18nProvider.tsx";
import { Field } from "./Field.tsx";
import type { ConvertMode } from "./ConvertModeSelect.tsx";

export function TalkInput({
  value,
  convertedKoe,
  convertMode,
  onChange,
}: {
  value: string;
  convertedKoe: string | null;
  convertMode: ConvertMode;
  onChange: (text: string) => void;
}) {
  const { t } = useI18n();

  const placeholders: Record<ConvertMode, string> = {
    none: t.placeholderNone,
    ja: t.placeholderJa,
    zh: t.placeholderZh,
  };

  return (
    <Field>
      <textarea
        style={{
          boxSizing: "border-box",
          width: "100%",
          height: "100px",
          padding: "0.5rem",
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholders[convertMode]}
      />
      {convertedKoe != null && (
        <p
          style={{
            boxSizing: "border-box",
            width: "100%",
            margin: "0.5rem 0 0",
            padding: "0.5rem",
            textAlign: "left",
            fontSize: "0.85rem",
            color: "#888",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
          }}
        >
          {convertedKoe}
        </p>
      )}
    </Field>
  );
}
