import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

const Organization = () => {
  const { t } = useTranslation();
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("pages.organizationTitle")}</h1>
          <p className="text-muted-foreground">{t("pages.organizationSubtitle")}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>{t("pages.organizationDetails")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("pages.organizationName")}</Label>
                <Input placeholder={t("register.yourAgency")} />
              </div>
              <Button>{t("pages.saveChanges")}</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{t("sidebar.subscription")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t("pages.currentPlan")}:</span>
                <Badge variant="secondary">{t("common.free")}</Badge>
              </div>
              <Button variant="outline">{t("pages.upgradePlan")}</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Organization;
