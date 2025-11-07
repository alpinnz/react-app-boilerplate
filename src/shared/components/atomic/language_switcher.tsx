import { useLanguage } from "@/shared/hooks/language/use_language.tsx";

export const LanguageSwitcher = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      aria-label="Toggle theme"
      className="
                inline-flex items-center justify-center
                w-10 h-10 rounded-lg transition-colors duration-200
                bg-neutral-50 text-neutral-700 shadow-sm
                hover:bg-muted hover:text-primary-500
                dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700
            "
    >
      {language === "id" ? "EN" : "ID"}
    </button>
  );
};
