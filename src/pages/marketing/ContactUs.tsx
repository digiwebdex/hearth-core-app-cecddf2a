import { useState } from "react";
import { useTranslation } from "react-i18next";
import MarketingLayout from "@/components/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import { publicApi } from "@/lib/publicApi";

const ContactUs = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await publicApi.submitContact(form);
      toast({ title: t("marketing.contact.sent"), description: t("marketing.contact.sentDesc") });
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err: any) {
      toast({ title: t("marketing.contact.errTitle"), description: err.message || t("marketing.contact.errDesc"), variant: "destructive" });
    } finally { setLoading(false); }
  };

  const info = [
    { icon: Phone, t: "phoneT", v: "phoneV", s: "phoneS" },
    { icon: Mail, t: "emailT", v: "emailV", s: "emailS" },
    { icon: MapPin, t: "officeT", v: "officeV", s: "officeS" },
    { icon: Clock, t: "hoursT", v: "hoursV", s: "hoursS" },
  ];

  return (
    <MarketingLayout title={t("marketing.contact.metaTitle")} description={t("marketing.contact.metaDesc")}>
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-amber-400/10 text-amber-400 border-amber-400/25 text-sm px-4 py-1.5">
            <MessageCircle className="mr-1.5 h-3.5 w-3.5 inline" />{t("marketing.contact.badge")}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{t("marketing.contact.title")}</h1>
          <p className="text-lg text-white/45 max-w-2xl mx-auto">{t("marketing.contact.subtitle")}</p>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-10 max-w-6xl mx-auto">
            <div className="lg:col-span-3">
              <Card className="bg-white/[0.04] border-white/8 text-white">
                <CardHeader><CardTitle>{t("marketing.contact.sendMsg")}</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label className="text-white/60">{t("marketing.contact.name")} *</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder={t("marketing.contact.namePh")} required className="bg-white/5 border-white/12 text-white placeholder:text-white/25" /></div>
                      <div className="space-y-2"><Label className="text-white/60">{t("marketing.contact.phone")}</Label><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder={t("marketing.contact.phonePh")} className="bg-white/5 border-white/12 text-white placeholder:text-white/25" /></div>
                    </div>
                    <div className="space-y-2"><Label className="text-white/60">{t("marketing.contact.email")} *</Label><Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder={t("marketing.contact.emailPh")} required className="bg-white/5 border-white/12 text-white placeholder:text-white/25" /></div>
                    <div className="space-y-2"><Label className="text-white/60">{t("marketing.contact.subject")} *</Label><Input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} placeholder={t("marketing.contact.subjectPh")} required className="bg-white/5 border-white/12 text-white placeholder:text-white/25" /></div>
                    <div className="space-y-2"><Label className="text-white/60">{t("marketing.contact.message")} *</Label><Textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder={t("marketing.contact.messagePh")} rows={5} required className="bg-white/5 border-white/12 text-white placeholder:text-white/25" /></div>
                    <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20">
                      <Send className="mr-2 h-4 w-4" />{loading ? t("marketing.contact.sending") : t("marketing.contact.send")}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {info.map((item) => (
                <div key={item.t} className="p-5 rounded-xl bg-white/[0.04] border border-white/8">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-0.5">{t(`marketing.contact.${item.t}`)}</h3>
                      <p className="text-sm text-white/60">{t(`marketing.contact.${item.v}`)}</p>
                      <p className="text-xs text-white/35">{t(`marketing.contact.${item.s}`)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default ContactUs;
