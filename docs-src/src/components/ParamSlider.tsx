import { Field } from "./Field.tsx";

export function ParamSlider({
  id,
  label,
  value,
  min,
  max,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <Field>
      <label htmlFor={id} style={{ marginRight: "0.5rem", display: "inline-block", minWidth: "5.5em", textAlign: "left" }}>
        {label}:
      </label>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          onChange(Number.isNaN(n) ? min : n);
        }}
        style={{ width: "60px", marginRight: "1rem" }}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{ verticalAlign: "middle" }}
      />
      <span style={{ marginLeft: "0.5rem" }}>{value}</span>
    </Field>
  );
}
