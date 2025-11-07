import * as React from "react";
import { NavbarMobile } from "@/shared/components/layout/user_layout/navbar_mobile.tsx";
import { useResponsive } from "@/shared/hooks/ui/use_responsive.tsx";
import { NavbarDesktop } from "@/shared/components/layout/user_layout/navbar_desktop.tsx";
import { SidebarDesktop } from "@/shared/components/layout/user_layout/sidebar/sidebar_desktop.tsx";
import { usePageTitle } from "@/shared/hooks/router/use_page_title.tsx";

interface UserLayoutProps {
  children: React.ReactNode;
}

export function UserLayout(props: UserLayoutProps) {
  const { isMobile, isTablet } = useResponsive();
  const title = usePageTitle();

  if (isMobile || isTablet) {
    return (
      <div className="relative min-h-screen text-app-primary  bg-app-surface-default">
        <NavbarMobile title={title} />
        <main className="p-4">{props.children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen text-app-primary  bg-app-surface-default">
      <SidebarDesktop />
      <div className="flex-1 flex flex-col">
        <NavbarDesktop title={title} />
        <main className="flex-1 overflow-y-auto p-6">{props.children}</main>
      </div>
    </div>
  );
}
