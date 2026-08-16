import { Field } from "./Field.tsx";

export type ConvertMode = "none" | "ja" | "zh";

const MODES: { id: ConvertMode; label: string }[] = [
  { id: "none", label: "なし (koe)" },
  { id: "ja", label: "日本語 (kanji2koe-openjtalk)" },
  { id: "zh", label: "中文 (chineseToKoe)" },
];

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
  return (
    <Field>
      <label htmlFor="convert-mode" style={{ marginRight: "0.5rem" }}>
        変換:
      </label>
      <select
        id="convert-mode"
        value={value}
        onChange={(e) => onChange(e.target.value as ConvertMode)}
        disabled={disabled}
      >
        {MODES.map((mode) => (
          <option key={mode.id} value={mode.id}>
            {mode.label}
          </option>
        ))}
      </select>
      {loading && (
        <span style={{ marginLeft: "0.5rem", fontSize: "0.85rem", color: "#888" }}>
          変換器を読み込み中...
        </span>
      )}
    </Field>
  );
}
