import { Field } from "./Field.tsx";
import type { ConvertMode } from "./ConvertModeSelect.tsx";

const PLACEHOLDERS: Record<ConvertMode, string> = {
  none: "喋らせたい文字を入力...",
  ja: "漢字かな交じり文を入力...",
  zh: "输入中文...",
};

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
        placeholder={PLACEHOLDERS[convertMode]}
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
