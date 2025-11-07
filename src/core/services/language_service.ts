import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend";

export type LanguageType = "id" | "en";

export class LanguageService {
  static SUPPORTED_LANGUAGES: LanguageType[] = ["id", "en"];
  static LANGUAGE_KEY: string = "language";

  static getCurrentLang(): LanguageType {
    const lang = localStorage.getItem(LanguageService.LANGUAGE_KEY);
    return this.SUPPORTED_LANGUAGES.includes(lang as LanguageType) ? (lang as LanguageType) : "id";
  }

  static async initialize() {
    try {
      await i18n
        .use(HttpApi) // untuk load file JSON eksternal
        .use(initReactI18next)
        .init({
          fallbackLng: "en",
          lng: this.getCurrentLang(),
          ns: ["common", "validation", "auth"], // daftar namespace
          defaultNS: "common", // namespace default
          interpolation: { escapeValue: false },
          backend: {
            loadPath: "/locales/{{lng}}/locate_{{lng}}_{{ns}}.json",
          },
        });
    } catch (error) {
      console.error(error);
    }
  }

  static setLanguage(lang: LanguageType) {
    localStorage.setItem(LanguageService.LANGUAGE_KEY, lang);
    i18n.changeLanguage(lang);
  }
}
