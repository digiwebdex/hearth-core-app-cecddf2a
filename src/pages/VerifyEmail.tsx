import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";
import { CheckCircle2, XCircle, Loader2, MailCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const VerifyEmail = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    token ? "loading" : "idle"
  );
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await authApi.verifyEmail(token);
        setState("success");
        setMessage(res.message || "Email verified.");
      } catch (err: any) {
        setState("error");
        setMessage(err.message || "Verification failed.");
      }
    })();
  }, [token]);

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.resendVerification();
      toast({ title: "Sent", description: "Check your inbox for the verification link." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed", description: err.message });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            {state === "loading" && <Loader2 className="h-7 w-7 text-primary animate-spin" />}
            {state === "success" && <CheckCircle2 className="h-7 w-7 text-primary" />}
            {state === "error" && <XCircle className="h-7 w-7 text-destructive" />}
            {state === "idle" && <MailCheck className="h-7 w-7 text-primary" />}
          </div>
          <CardTitle className="text-2xl">
            {state === "success" && "Email verified"}
            {state === "error" && "Verification failed"}
            {state === "loading" && "Verifying…"}
            {state === "idle" && "Verify your email"}
          </CardTitle>
          <CardDescription>
            {state === "idle" &&
              "We sent a verification link to your inbox. Click it to confirm your email."}
            {message && state !== "idle" && message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {state === "success" && (
            <Button className="w-full" onClick={() => navigate(user ? "/dashboard" : "/login")}>
              Continue
            </Button>
          )}
          {(state === "idle" || state === "error") && user && (
            <Button
              variant="outline"
              className="w-full"
              disabled={resending}
              onClick={handleResend}
            >
              {resending ? "Sending…" : "Resend verification email"}
            </Button>
          )}
          {!user && (
            <p className="text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-primary underline">
                Back to login
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
