import * as React from "react";
import { ChevronRight } from "lucide-react";
import {
  type SidebarMenuItem,
  SidebarMenuItemData,
} from "@/shared/components/layout/user_layout/sidebar/sidebar.ts";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function SidebarMobile({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const location = useLocation();
  const { t } = useTranslation();

  const toggle = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const renderItems = (items: SidebarMenuItem[], level = 0): React.ReactNode =>
    items.map((item) => {
      const isExpanded = expanded[item.key];
      const hasChildren = !!item.children;
      const indent = `pl-${Math.min(level * 4, 12)}`;
      const isActive = item.href && location.pathname === item.href;

      return (
        <div key={item.key} className={`${indent}`}>
          <div
            className={`
                            group flex items-center justify-between px-3 py-2 rounded-lg transition-colors
                            ${
                              isActive
                                ? "bg-app-default text-primary bg-primary-100 dark:bg-neutral-800 text-p14-semibold"
                                : "text-variant-neutral hover:bg-primary-100 dark:hover:bg-neutral-800 text-p14-regular"
                            }
                        `}
          >
            {/* Left: Icon + Label */}
            <div className="flex items-center space-x-3 flex-1">
              {item.icon && (
                <item.icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive
                      ? "text-primary-600 dark:text-primary-300"
                      : "text-primary-500 dark:text-neutral-400"
                  }`}
                />
              )}

              {item.href ? (
                <Link
                  to={item.href}
                  className="block w-full text-left text-p14-regular text-app-primary"
                >
                  {t(item.label, { ns: "layout" })}
                </Link>
              ) : (
                <button
                  onClick={() => hasChildren && toggle(item.key)}
                  className="block w-full text-left text-p14-regular text-app-primary"
                >
                  {t(item.label, { ns: "layout" })}
                </button>
              )}
            </div>

            {/* Chevron */}
            {hasChildren && (
              <button onClick={() => toggle(item.key)} className="ml-2 p-1">
                <ChevronRight
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isExpanded ? "rotate-90" : ""
                  } ${
                    isActive
                      ? "text-primary-600 dark:text-primary-300"
                      : "text-neutral-500 dark:text-neutral-400"
                  }`}
                />
              </button>
            )}
          </div>

          {/* Children */}
          {hasChildren && isExpanded && (
            <div className="ml-4 mt-1 space-y-1">{renderItems(item.children!, level + 1)}</div>
          )}
        </div>
      );
    });

  return (
    <aside
      ref={sidebarRef}
      className={`
                fixed top-12 left-0 z-50 w-full max-w-sm h-[calc(100vh-4rem)] overflow-y-auto
                bg-app-default  shadow-md border-t border-app-default dark:border-white/10 dark:shadow-lg
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
            `}
    >
      <nav className="px-4 pb-6 space-y-2 text-sm">
        {SidebarMenuItemData.map((section) => (
          <div key={section.key}>
            <div className="text-primary-600 dark:text-primary-300 text-p12-semibold uppercase px-2 pt-4 pb-2">
              {t(section.label, { ns: "layout" })}
            </div>
            {renderItems(section.children ?? [])}
          </div>
        ))}
      </nav>
    </aside>
  );
}
