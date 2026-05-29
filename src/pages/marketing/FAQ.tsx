import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MarketingLayout from "@/components/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";

const FAQ = () => {
  const { t } = useTranslation();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setOpenItems((p) => ({ ...p, [key]: !p[key] }));

  const cats: { key: string; items: { q: string; a: string }[] }[] = [
    { key: "general", items: [["g1q","g1a"],["g2q","g2a"],["g3q","g3a"],["g4q","g4a"]].map(([q,a])=>({q:t(`marketing.faqPage.items.${q}`),a:t(`marketing.faqPage.items.${a}`)})) },
    { key: "pricing", items: [["p1q","p1a"],["p2q","p2a"],["p3q","p3a"]].map(([q,a])=>({q:t(`marketing.faqPage.items.${q}`),a:t(`marketing.faqPage.items.${a}`)})) },
    { key: "features", items: [["f1q","f1a"],["f2q","f2a"],["f3q","f3a"],["f4q","f4a"],["f5q","f5a"]].map(([q,a])=>({q:t(`marketing.faqPage.items.${q}`),a:t(`marketing.faqPage.items.${a}`)})) },
    { key: "security", items: [["s1q","s1a"],["s2q","s2a"],["s3q","s3a"]].map(([q,a])=>({q:t(`marketing.faqPage.items.${q}`),a:t(`marketing.faqPage.items.${a}`)})) },
    { key: "support", items: [["sup1q","sup1a"],["sup2q","sup2a"],["sup3q","sup3a"]].map(([q,a])=>({q:t(`marketing.faqPage.items.${q}`),a:t(`marketing.faqPage.items.${a}`)})) },
  ];

  return (
    <MarketingLayout title={t("marketing.faqPage.metaTitle")} description={t("marketing.faqPage.metaDesc")}>
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-amber-400/10 text-amber-400 border-amber-400/25 text-sm px-4 py-1.5">
            <HelpCircle className="mr-1.5 h-3.5 w-3.5 inline" />{t("marketing.faqPage.badge")}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{t("marketing.faqPage.title")}</h1>
          <p className="text-lg text-white/45 max-w-2xl mx-auto">
            {t("marketing.faqPage.subA")} <Link to="/contact-us" className="text-amber-400 hover:underline">{t("marketing.faqPage.subContact")}</Link>.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-10">
            {cats.map((cat) => (
              <div key={cat.key}>
                <h2 className="text-xl font-bold mb-4 text-amber-400">{t(`marketing.faqPage.cats.${cat.key}`)}</h2>
                <div className="space-y-2">
                  {cat.items.map((item, i) => {
                    const key = `${cat.key}-${i}`;
                    const isOpen = openItems[key];
                    return (
                      <div key={key} className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
                        <button onClick={() => toggle(key)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.03] transition-colors">
                          <span className="font-medium text-sm pr-4">{item.q}</span>
                          <ChevronDown className={`h-4 w-4 text-white/35 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>
                        {isOpen && (<div className="px-5 pb-4"><p className="text-sm text-white/45 leading-relaxed">{item.a}</p></div>)}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#0f1729]">
        <div className="container mx-auto px-4 text-center">
          <MessageCircle className="h-10 w-10 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">{t("marketing.faqPage.stillHave")}</h2>
          <p className="text-white/45 max-w-md mx-auto mb-6">{t("marketing.faqPage.stillDesc")}</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/demo"><Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 shadow-lg shadow-amber-500/25">{t("marketing.faqPage.bookDemo")}</Button></Link>
            <Link to="/contact-us"><Button size="lg" variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10 px-8">{t("marketing.faqPage.contactSupport")}</Button></Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default FAQ;
