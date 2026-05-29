import { useState } from "react";
import { useTranslation } from "react-i18next";
import MarketingLayout from "@/components/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Monitor, Users, Zap } from "lucide-react";
import { publicApi } from "@/lib/publicApi";

const Demo = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", teamSize: "", message: "" });
  const update = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await publicApi.submitDemo(form);
      toast({ title: t("marketing.demo.submitted"), description: t("marketing.demo.submittedDesc") });
      setForm({ name: "", email: "", phone: "", company: "", teamSize: "", message: "" });
    } catch (err: any) {
      toast({ title: t("marketing.demo.errTitle"), description: err.message || t("marketing.demo.errDesc"), variant: "destructive" });
    } finally { setLoading(false); }
  };

  const expects = [
    { icon: Monitor, t: "e1t", d: "e1d" },
    { icon: Users, t: "e2t", d: "e2d" },
    { icon: Zap, t: "e3t", d: "e3d" },
    { icon: Clock, t: "e4t", d: "e4d" },
  ];

  return (
    <MarketingLayout title={t("marketing.demo.metaTitle")} description={t("marketing.demo.metaDesc")}>
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 opacity-12" style={{ backgroundImage: "radial-gradient(circle at 30% 40%, hsl(35, 92%, 50%), transparent 50%)" }} />
        <div className="container mx-auto px-4 text-center relative">
          <Badge className="mb-6 bg-amber-400/10 text-amber-400 border-amber-400/25 text-sm px-4 py-1.5">
            <Calendar className="mr-1.5 h-3.5 w-3.5 inline" />{t("marketing.demo.badge")}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{t("marketing.demo.title")}</h1>
          <p className="text-lg text-white/45 max-w-2xl mx-auto">{t("marketing.demo.subtitle")}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <Card className="bg-white/[0.04] border-white/8 text-white">
              <CardHeader><CardTitle className="text-xl">{t("marketing.demo.request")}</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label className="text-white/60">{t("marketing.demo.fullName")} *</Label><Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder={t("marketing.demo.fullNamePh")} required className="bg-white/5 border-white/12 text-white placeholder:text-white/25" /></div>
                    <div className="space-y-2"><Label className="text-white/60">{t("marketing.demo.company")} *</Label><Input value={form.company} onChange={(e) => update("company", e.target.value)} placeholder={t("marketing.demo.companyPh")} required className="bg-white/5 border-white/12 text-white placeholder:text-white/25" /></div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label className="text-white/60">{t("marketing.demo.email")} *</Label><Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder={t("marketing.demo.emailPh")} required className="bg-white/5 border-white/12 text-white placeholder:text-white/25" /></div>
                    <div className="space-y-2"><Label className="text-white/60">{t("marketing.demo.phone")} *</Label><Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder={t("marketing.demo.phonePh")} required className="bg-white/5 border-white/12 text-white placeholder:text-white/25" /></div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/60">{t("marketing.demo.teamSize")}</Label>
                    <Select value={form.teamSize} onValueChange={(v) => update("teamSize", v)}>
                      <SelectTrigger className="bg-white/5 border-white/12 text-white"><SelectValue placeholder={t("marketing.demo.teamSizePh")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-3">{t("marketing.demo.team1")}</SelectItem>
                        <SelectItem value="4-10">{t("marketing.demo.team2")}</SelectItem>
                        <SelectItem value="11-30">{t("marketing.demo.team3")}</SelectItem>
                        <SelectItem value="30+">{t("marketing.demo.team4")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label className="text-white/60">{t("marketing.demo.wantSee")}</Label><Textarea value={form.message} onChange={(e) => update("message", e.target.value)} placeholder={t("marketing.demo.wantSeePh")} rows={4} className="bg-white/5 border-white/12 text-white placeholder:text-white/25" /></div>
                  <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20">
                    {loading ? t("marketing.demo.submitting") : t("marketing.demo.submit")}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-6">{t("marketing.demo.expectTitle")}</h3>
                <div className="space-y-5">
                  {expects.map((item) => (
                    <div key={item.t} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center shrink-0">
                        <item.icon className="h-5 w-5 text-amber-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{t(`marketing.demo.${item.t}`)}</h4>
                        <p className="text-sm text-white/45">{t(`marketing.demo.${item.d}`)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/8">
                <h4 className="font-semibold mb-3">{t("marketing.demo.trustedTitle")}</h4>
                <div className="space-y-3">
                  <p className="text-sm text-white/35 italic">{t("marketing.demo.quote1")}</p>
                  <p className="text-sm text-white/35 italic">{t("marketing.demo.quote2")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default Demo;
