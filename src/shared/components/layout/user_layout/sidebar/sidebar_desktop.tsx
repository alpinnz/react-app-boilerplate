import * as React from "react";
import { ChevronRight } from "lucide-react";
import {
  type SidebarMenuItem,
  SidebarMenuItemData,
} from "@/shared/components/layout/user_layout/sidebar/sidebar.ts";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function SidebarDesktop() {
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const location = useLocation();
  const { t } = useTranslation();

  const toggle = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderItems = (items: SidebarMenuItem[], level = 0): React.ReactNode =>
    items.map((item) => {
      const isOpen = expanded[item.key];
      const hasChildren = !!item.children;
      const indent = `pl-${Math.min(level * 4, 12)}`;

      const isActive = item.href && location.pathname === item.href;

      return (
        <div key={item.key} className={`${indent}`}>
          <div
            className={`
                            flex items-center justify-between px-3 py-2 rounded-lg text-l14-regular transition-colors
                            ${
                              isActive
                                ? "bg-app-default text-primary bg-primary-100 dark:bg-neutral-800 text-l14-semibold"
                                : "text-variant-neutral hover:bg-primary-100 dark:hover:bg-neutral-800 text-l14-regular"
                            }
                        `}
          >
            <div className="flex items-center space-x-3 flex-1">
              {item.icon && (
                <item.icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? "text-primary-600 dark:text-primary-300"
                      : "text-primary-500 dark:text-neutral-400"
                  }`}
                />
              )}
              {item.href ? (
                <Link
                  to={item.href}
                  className="w-full text-left truncate text-l14-regular text-app-primary"
                >
                  {t(item.label, { ns: "layout" })}
                </Link>
              ) : (
                <button
                  onClick={() => hasChildren && toggle(item.key)}
                  className="w-full text-left truncate text-l14-regular text-app-primary"
                >
                  {t(item.label, { ns: "layout" })}
                </button>
              )}
            </div>
            {hasChildren && (
              <button onClick={() => toggle(item.key)}>
                <ChevronRight
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isOpen ? "rotate-90" : ""
                  } ${
                    isActive
                      ? "text-primary-600 dark:text-primary-300"
                      : "text-neutral-500 dark:text-neutral-400"
                  }`}
                />
              </button>
            )}
          </div>

          {hasChildren && isOpen && (
            <div className="ml-4 mt-1 space-y-1">{renderItems(item.children!, level + 1)}</div>
          )}
        </div>
      );
    });

  return (
    <aside className="w-64 h-screen bg-app-default shadow-md border-r border-app-default hidden md:flex flex-col">
      {/* Logo */}
      <div className="px-6 py-4 text-h20-bold text-neutral-900 dark:text-white border-b border-app-default flex items-center gap-2">
        <img src="/logo.svg" alt="Logo" className="w-6 h-6" />
        Company
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-4 text-sm overflow-y-auto space-y-6">
        {SidebarMenuItemData.map((section) => (
          <div key={section.key}>
            <div className="text-l12-semibold uppercase text-primary-600 dark:text-primary-300 px-2 pt-4 pb-2 tracking-wide">
              {t(section.label, { ns: "layout" })}
            </div>
            {renderItems(section.children ?? [])}
          </div>
        ))}
      </nav>
    </aside>
  );
}
