import { useTranslation } from "react-i18next";
import MarketingLayout from "@/components/MarketingLayout";
import { LegalRenderer } from "@/components/LegalRenderer";

const Privacy = () => {
  const { t } = useTranslation();
  return (
    <MarketingLayout title={t("marketing.legal.privacyTitle")} description={t("marketing.legal.privacyMeta")}>
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">{t("marketing.legal.privacyTitle")}</h1>
          <p className="text-white/40 text-sm mb-10">{t("marketing.legal.lastUpdated")}</p>
          <LegalRenderer ns="privacy" />
        </div>
      </section>
    </MarketingLayout>
  );
};

export default Privacy;
