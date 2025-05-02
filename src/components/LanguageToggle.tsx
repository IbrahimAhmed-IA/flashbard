import { Globe } from "lucide-react";
import { useLanguage } from "./LanguageProvider";
import { Button } from "./ui/button";

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className="border-none"
      onClick={toggleLanguage}
      aria-label={language === "en" ? t("settings.arabic") : t("settings.english")}
    >
      <Globe className="h-5 w-5" />
    </Button>
  );
}
