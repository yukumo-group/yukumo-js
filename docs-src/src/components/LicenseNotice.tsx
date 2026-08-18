import { Fragment } from "react";
import { useI18n } from "../i18n/I18nProvider.tsx";

function LinkedText({
  template,
  links,
}: {
  template: string;
  links: Record<string, { href: string; label: string }>;
}) {
  const parts = template.split(/(\{\w+\})/g);
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\{(\w+)\}$/);
        if (match) {
          const link = links[match[1]];
          if (link) {
            return (
              <a key={i} href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            );
          }
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

export function LicenseNotice() {
  const { t } = useI18n();

  return (
    <div style={{ marginTop: "2rem", fontSize: "0.8rem", color: "#666" }}>
      <p>{t.licenseAquestalk}</p>
      <p>{t.licenseCopyright}</p>
      <p>
        <LinkedText
          template={t.licenseKanji}
          links={{
            link: {
              href: "https://www.a-quest.com/products/aqkanji2koe.html",
              label: "AqKanji2Koe",
            },
          }}
        />
      </p>
      <p>
        <LinkedText
          template={t.licenseZh}
          links={{
            pinyin: {
              href: "https://github.com/Love-Kogasa/pinyinToKana.js",
              label: "pinyin-to-kana",
            },
            tiny: {
              href: "https://github.com/creeperyang/pinyin",
              label: "tiny-pinyin",
            },
          }}
        />
      </p>
    </div>
  );
}
