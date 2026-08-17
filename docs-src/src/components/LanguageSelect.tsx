import { LOCALES } from "../i18n/messages.ts";
import { useI18n } from "../i18n/I18nProvider.tsx";
import { Field } from "./Field.tsx";

export function LanguageSelect() {
  const { locale, setLocale, t } = useI18n();

  return (
    <Field>
      <label htmlFor="language-select" style={{ marginRight: "0.5rem" }}>
        {t.language}:
      </label>
      <select
        id="language-select"
        value={locale}
        onChange={(e) => setLocale(e.target.value as typeof locale)}
      >
        {LOCALES.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
