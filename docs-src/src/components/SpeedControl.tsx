import { Field } from "./Field.tsx";

export function SpeedControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (speed: number) => void;
}) {
  return (
    <Field>
      <label htmlFor="speed-input" style={{ marginRight: "0.5rem" }}>
        Speed:
      </label>
      <input
        id="speed-input"
        type="number"
        min="50"
        max="300"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 100)}
        style={{ width: "60px", marginRight: "1rem" }}
      />
      <input
        type="range"
        min="50"
        max="300"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{ verticalAlign: "middle" }}
      />
      <span style={{ marginLeft: "0.5rem" }}>{value}</span>
    </Field>
  );
}
