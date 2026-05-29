import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";

const LanguageSwitcher = ({ className = "" }: { className?: string }) => {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith("bn") ? "bn" : "en";
  const toggle = () => i18n.changeLanguage(current === "bn" ? "en" : "bn");

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={toggle}
      className={`gap-1.5 h-9 px-2.5 ${className}`}
      aria-label="Toggle language"
    >
      <Languages className="h-4 w-4" />
      <span className="text-xs font-semibold">
        {current === "bn" ? "EN" : "বাংলা"}
      </span>
    </Button>
  );
};

export default LanguageSwitcher;
