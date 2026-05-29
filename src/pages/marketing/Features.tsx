import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MarketingLayout from "@/components/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, FileText, Plane, Receipt, Store, Shield, BarChart3, Moon,
  Target, ArrowRight, CheckCircle2, Zap, UserCheck, MapPin,
} from "lucide-react";

const Features = () => {
  const { t } = useTranslation();
  const groupDefs = [
    { key: "leads", icon: Target, color: "from-amber-500/15 to-orange-500/15" },
    { key: "quotes", icon: FileText, color: "from-violet-500/15 to-purple-500/15" },
    { key: "bookings", icon: Plane, color: "from-emerald-500/15 to-teal-500/15" },
    { key: "invoices", icon: Receipt, color: "from-amber-500/15 to-yellow-500/15" },
    { key: "vendors", icon: Store, color: "from-rose-500/15 to-pink-500/15" },
    { key: "team", icon: Shield, color: "from-sky-500/15 to-indigo-500/15" },
    { key: "reports", icon: BarChart3, color: "from-teal-500/15 to-emerald-500/15" },
    { key: "hajj", icon: Moon, color: "from-yellow-500/15 to-amber-500/15" },
  ];

  return (
    <MarketingLayout title={t("marketing.features.metaTitle")} description={t("marketing.features.metaDesc")}>
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 opacity-12" style={{
          backgroundImage: "radial-gradient(circle at 25% 50%, hsl(35, 92%, 50%) 0%, transparent 50%), radial-gradient(circle at 75% 50%, hsl(25, 95%, 45%) 0%, transparent 50%)",
        }} />
        <div className="container mx-auto px-4 text-center relative">
          <Badge className="mb-6 bg-amber-400/10 text-amber-400 border-amber-400/25 text-sm px-4 py-1.5">{t("marketing.features.badge")}</Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            {t("marketing.features.heroTitleA")}<br />
            {t("marketing.features.heroTitleB")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">{t("marketing.features.heroTitleC")}</span>
          </h1>
          <p className="text-lg md:text-xl text-white/45 max-w-3xl mx-auto mb-10">{t("marketing.features.heroSub")}</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/pricing"><Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 h-12 shadow-lg shadow-amber-500/25"><Zap className="mr-2 h-5 w-5" />{t("marketing.features.viewPlans")}</Button></Link>
            <Link to="/demo"><Button size="lg" variant="outline" className="border-white/15 text-white hover:bg-white/10 px-8 h-12">{t("marketing.features.bookDemo")}<ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#0f1729]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">{t("marketing.features.workflowTitle")}</h2>
            <p className="text-white/45">{t("marketing.features.workflowSub")}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-2 max-w-5xl mx-auto">
            {[
              { icon: Target, k: "step1" }, { icon: FileText, k: "step2" }, { icon: UserCheck, k: "step3" },
              { icon: Plane, k: "step4" }, { icon: Receipt, k: "step5" }, { icon: MapPin, k: "step6" },
            ].map((step, i) => (
              <div key={step.k} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/8 min-w-[120px]">
                  <step.icon className="h-6 w-6 text-amber-400" />
                  <span className="text-xs font-medium text-white/60">{t(`marketing.features.${step.k}`)}</span>
                </div>
                {i < 5 && <ArrowRight className="h-4 w-4 text-white/15 hidden md:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="space-y-24">
            {groupDefs.map((g, idx) => {
              const points = t(`marketing.features.groups.${g.key}P`, { returnObjects: true }) as string[];
              return (
                <div key={g.key} className={`grid lg:grid-cols-2 gap-12 items-center ${idx % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                  <div className={idx % 2 === 1 ? "lg:order-2" : ""}>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${g.color} flex items-center justify-center mb-5 border border-amber-500/10`}>
                      <g.icon className="h-7 w-7 text-amber-400" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-3">{t(`marketing.features.groups.${g.key}T`)}</h3>
                    <p className="text-white/45 mb-6 text-lg">{t(`marketing.features.groups.${g.key}D`)}</p>
                    <ul className="space-y-3">
                      {Array.isArray(points) && points.map((pt) => (
                        <li key={pt} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                          <span className="text-white/60 text-sm">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={`rounded-2xl bg-gradient-to-br ${g.color} p-8 md:p-12 flex items-center justify-center min-h-[280px] border border-white/5 ${idx % 2 === 1 ? "lg:order-1" : ""}`}>
                    <g.icon className="h-24 w-24 text-white/15" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#0f1729]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("marketing.features.ctaTitle")}</h2>
          <p className="text-white/45 max-w-xl mx-auto mb-8">{t("marketing.features.ctaSub")}</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/pricing"><Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 h-12 shadow-lg shadow-amber-500/25">{t("marketing.features.viewPricing")}</Button></Link>
            <Link to="/demo"><Button size="lg" variant="outline" className="border-white/15 text-white hover:bg-white/10 px-8 h-12">{t("marketing.features.scheduleDemo")}</Button></Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default Features;
