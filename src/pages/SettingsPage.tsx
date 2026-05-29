import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SmtpSettings from "@/components/SmtpSettings";
import DataExport from "@/components/DataExport";
import { CreditCard, ArrowRight } from "lucide-react";

const SettingsPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account, billing and email settings</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" /> Billing & Subscription
                </CardTitle>
                <CardDescription>Plan, trial status, invoices & upgrades</CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link to="/settings/billing">
                  Manage billing <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="you@example.com" disabled />
            </div>
            <Button>Update Profile</Button>
          </CardContent>
        </Card>
        <SmtpSettings />
        <DataExport />
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;

