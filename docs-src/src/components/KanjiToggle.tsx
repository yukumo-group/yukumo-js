import { Field } from "./Field.tsx";

export function KanjiToggle({
  checked,
  disabled,
  loading,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  loading: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <Field>
      <label htmlFor="convert-kanji" style={{ cursor: "pointer" }}>
        <input
          id="convert-kanji"
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          style={{ marginRight: "0.5rem", verticalAlign: "middle" }}
        />
        漢字変換 (kanji2koe-openjtalk)
      </label>
      {loading && (
        <span style={{ marginLeft: "0.5rem", fontSize: "0.85rem", color: "#888" }}>
          変換器を読み込み中...
        </span>
      )}
    </Field>
  );
}
