import { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Clock, CheckCircle2 } from "lucide-react";
import { PLANS } from "@/lib/plans";

const Register = () => {
  const [searchParams] = useSearchParams();
  const planParam = (searchParams.get("plan") || "pro").toLowerCase();
  const selectedPlan = useMemo(
    () => PLANS.find((p) => p.id === planParam) || PLANS.find((p) => p.id === "pro") || PLANS[0],
    [planParam]
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isFree = selectedPlan.id === "free";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await register({ name, email, password, tenantName, plan: selectedPlan.id });
      if (result.pendingApproval) {
        toast({
          title: "Account submitted",
          description: result.message || "Pending admin approval.",
        });
        navigate("/login");
      } else {
        toast({
          title: isFree ? "Welcome!" : "🎉 3-day Pro Trial Started!",
          description: isFree
            ? "Your free account is ready."
            : "Explore all Pro features for the next 3 days.",
        });
        navigate("/onboarding");
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Registration failed", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>
            Start your travel agency in minutes — no credit card required.
          </CardDescription>
          <div className="mt-3 flex flex-col items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Selected plan: <span className="ml-1 font-semibold">{selectedPlan.name}</span>
            </Badge>
            {!isFree && (
              <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 text-xs font-medium">
                <Clock className="h-3.5 w-3.5" />
                3-day Pro trial · full access
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenantName">Agency / Organization Name</Label>
              <Input id="tenantName" value={tenantName} onChange={(e) => setTenantName(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : isFree ? "Create Free Account" : "Start 3-Day Free Trial"}
            </Button>
            <div className="space-y-1.5 pt-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> No credit card required</p>
              <p className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Instant access — no waiting for approval</p>
              <p className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Cancel anytime</p>
            </div>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
