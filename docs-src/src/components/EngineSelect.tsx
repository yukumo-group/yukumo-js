import { ENGINES, type EngineId } from "../engines.ts";
import { Field } from "./Field.tsx";

export function EngineSelect({
  value,
  disabled,
  onChange,
}: {
  value: EngineId;
  disabled: boolean;
  onChange: (id: EngineId) => void;
}) {
  return (
    <Field>
      <label htmlFor="engine-select" style={{ marginRight: "0.5rem" }}>
        Engine:
      </label>
      <select
        id="engine-select"
        value={value}
        onChange={(e) => onChange(e.target.value as EngineId)}
        disabled={disabled}
      >
        {ENGINES.map((eng) => (
          <option key={eng.id} value={eng.id}>
            {eng.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
