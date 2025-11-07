import { CheckCircle, LogOut, Moon, Sun, User } from "lucide-react";
import { useTheme } from "@/shared/hooks/theme/use_theme.tsx";
import { useTranslation } from "react-i18next";
import * as React from "react";
import { Popover, Transition } from "@headlessui/react";
import { useLanguage } from "@/shared/hooks/language/use_language.tsx";
import { useAuthContext } from "@/features/app/providers/auth";

export function ProfilePopover() {
  const authState = useAuthContext((state) => state);
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation("layout");
  const { language, toggleLanguage } = useLanguage();

  return (
    // <Popover className="relative z-[60]">
    <Popover className="relative z-[60]">
      <Popover.Button className="w-6 md:w-7 h-6 md:h-7 rounded-full bg-success-600 text-app-inverted flex items-center justify-center text-l10-semibold md:text-l12-semibold shadow-md hover:brightness-95 transition focus:outline-none ">
        AN
      </Popover.Button>

      <Transition as={React.Fragment}>
        <Popover.Panel className="absolute right-0 mt-2 w-64 rounded-xl bg-app-default  shadow-xl ring-1 ring-app-neutral p-4 z-50">
          <div className="flex items-center gap-3">
            <div className="w-6 md:w-7 h-6 md:h-7 rounded-full bg-success-600 text-white flex items-center justify-center text-l10-semibold md:text-l12-semibold">
              AN
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1 text-p14-semibold text-app-primary">
                {authState.auth?.user?.first_name ?? ""} {authState.auth?.user?.last_name ?? ""}
                <CheckCircle className="w-4 h-4 text-success-500" />
              </div>
              <div className="text-p12-regular text-app-secondary ">
                {authState.auth?.user?.email ?? "-"} •{" "}
                <span className="text-success-500 font-medium">Online</span>
              </div>
            </div>
          </div>

          <hr className="my-3 border-border dark:border-border-dark" />

          <div className="space-y-2">
            <button
              className="w-full flex items-center gap-2 text-p14-medium text-variant-neutral hover:text-variant-primary transition"
              onClick={() => {}}
            >
              <User className="w-4 h-4" />
              {t("common.view_profile")}
            </button>

            <button
              className="w-full flex items-center gap-2 text-p14-medium text-variant-neutral hover:text-variant-primary transition"
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4 text-warning-400" />
                  {t("common.theme_toggle_light")}
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-neutral-700" />
                  {t("common.theme_toggle_dark")}
                </>
              )}
            </button>

            <button
              className="w-full flex items-center gap-2 text-p14-medium text-variant-neutral hover:text-variant-primary transition"
              onClick={toggleLanguage}
            >
              <div className="w-4 h-4 flex items-center justify-center text-xs font-semibold">
                {language === "id" ? "EN" : "ID"}
              </div>
              {language === "id" ? t("common.language_en") : t("common.language_id")}
            </button>

            <button
              className="w-full flex items-center gap-2 text-p14-medium text-variant-neutral hover:text-variant-primary transition"
              onClick={() => authState.logout()}
            >
              <LogOut className="w-4 h-4" />
              {t("common.logout")}
            </button>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
