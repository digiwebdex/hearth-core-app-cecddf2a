import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Clock, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TrialBanner = () => {
  const { isTrialActive, trialDaysLeft } = useAuth();
  const navigate = useNavigate();

  if (!isTrialActive) return null;

  const urgent = trialDaysLeft <= 1;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2 text-sm ${
        urgent
          ? "bg-destructive/10 border-destructive/30 text-destructive"
          : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
      }`}
    >
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <span>
          <strong>Pro Trial:</strong>{" "}
          {trialDaysLeft > 0
            ? `${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left`
            : "Ending today"}
          {" "}— upgrade anytime to keep all features.
        </span>
      </div>
      <Button size="sm" variant={urgent ? "destructive" : "default"} onClick={() => navigate("/subscription")} className="gap-1.5">
        <Crown className="h-3.5 w-3.5" /> Upgrade Now
      </Button>
    </div>
  );
};

export default TrialBanner;
