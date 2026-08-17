import { useI18n } from "../i18n/I18nProvider.tsx";
import { Field } from "./Field.tsx";

export type ConvertMode = "none" | "ja" | "zh";

export function ConvertModeSelect({
  value,
  disabled,
  loading,
  onChange,
}: {
  value: ConvertMode;
  disabled: boolean;
  loading: boolean;
  onChange: (mode: ConvertMode) => void;
}) {
  const { t } = useI18n();

  const modes: { id: ConvertMode; label: string }[] = [
    { id: "none", label: t.convertNone },
    { id: "ja", label: t.convertJa },
    { id: "zh", label: t.convertZh },
  ];

  return (
    <Field>
      <label htmlFor="convert-mode" style={{ marginRight: "0.5rem" }}>
        {t.convert}:
      </label>
      <select
        id="convert-mode"
        value={value}
        onChange={(e) => onChange(e.target.value as ConvertMode)}
        disabled={disabled}
      >
        {modes.map((mode) => (
          <option key={mode.id} value={mode.id}>
            {mode.label}
          </option>
        ))}
      </select>
      {loading && (
        <span style={{ marginLeft: "0.5rem", fontSize: "0.85rem", color: "#888" }}>
          {t.convertLoading}
        </span>
      )}
    </Field>
  );
}
