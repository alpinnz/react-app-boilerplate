import { useTheme } from "@/shared/hooks/theme/use_theme.tsx";
import { Moon, Sun } from "lucide-react";

export const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="
                inline-flex items-center justify-center
                w-10 h-10 rounded-lg transition-colors duration-200
                bg-neutral-50 text-neutral-700 shadow-sm
                hover:bg-muted hover:text-primary-500
                dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700
            "
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-warning-400" />
      ) : (
        <Moon className="w-5 h-5 text-neutral-700" />
      )}
    </button>
  );
};
