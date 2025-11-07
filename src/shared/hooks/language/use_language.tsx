import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageService, type LanguageType } from "@/core/services/language_service.ts";

export function useLanguage() {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState<LanguageType>(LanguageService.getCurrentLang());

  useEffect(() => {
    LanguageService.setLanguage(language);
  }, [language, i18n]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "id" ? "en" : "id"));
  };

  return {
    language,
    setLanguage,
    toggleLanguage,
  };
}
