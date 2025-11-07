import * as React from "react";
import { usePageTitle } from "@/shared/hooks/router/use_page_title.tsx";
import { ThemeSwitcher } from "@/shared/components/atomic/theme_switcher.tsx";
import { LanguageSwitcher } from "@/shared/components/atomic/language_switcher.tsx";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout(props: AuthLayoutProps) {
  const { children } = props;
  const title = usePageTitle();

  React.useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-neutral-100 dark:bg-neutral-900 transition-colors duration-300">
      {/* Language & Theme Switcher */}
      <div className="absolute top-4 right-4 flex gap-2">
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>

      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl bg-neutral-50 dark:bg-neutral-800 p-8 shadow-lg transition-all duration-300">
        <div className="flex flex-col items-center mb-6">
          <img className="h-24 w-auto" src="/logo.svg" alt="Company" />
        </div>
        {children}
      </div>
    </div>
  );
}
