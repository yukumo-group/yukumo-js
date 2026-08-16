import { Field } from "./Field.tsx";

export function TalkInput({
  value,
  convertedKoe,
  convertKanji,
  onChange,
}: {
  value: string;
  convertedKoe: string | null;
  convertKanji: boolean;
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
        placeholder={
          convertKanji
            ? "漢字かな交じり文を入力..."
            : "喋らせたい文字を入力..."
        }
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
