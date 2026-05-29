import { useTranslation } from "react-i18next";

type Section = { h: string; p?: string[]; list?: string[]; contact?: boolean };

const renderInline = (s: string) => {
  const parts = s.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="text-white/80">{p.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{p}</span>
    )
  );
};

export const LegalRenderer = ({ ns }: { ns: "privacy" | "terms" }) => {
  const { t } = useTranslation();
  const sections = t(`marketing.${ns}.sections`, { returnObjects: true }) as Section[];
  if (!Array.isArray(sections)) return null;
  return (
    <div className="prose prose-invert max-w-none space-y-8 text-white/60 text-sm leading-relaxed">
      {sections.map((sec, idx) => (
        <section key={idx}>
          <h2 className="text-lg font-bold text-white mb-2">{sec.h}</h2>
          {sec.p?.map((para, i) => <p key={i}>{renderInline(para)}</p>)}
          {sec.list && (
            <ul className="list-disc pl-5 space-y-1">
              {sec.list.map((li, i) => <li key={i}>{renderInline(li)}</li>)}
            </ul>
          )}
          {sec.contact && (
            <p className="whitespace-pre-line">{t("marketing.legal.contactBody")}</p>
          )}
        </section>
      ))}
    </div>
  );
};
