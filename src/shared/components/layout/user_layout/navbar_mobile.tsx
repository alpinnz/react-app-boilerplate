import * as React from "react";
import { Bell, Menu, X } from "lucide-react";
import { SidebarMobile } from "@/shared/components/layout/user_layout/sidebar/sidebar_mobile.tsx";
import { ProfilePopover } from "@/shared/components/layout/user_layout/profile_popover.tsx";

interface NavbarMobileProps {
  title?: string;
}

export function NavbarMobile(props: NavbarMobileProps): React.JSX.Element {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 py-3 border-b shadow-sm bg-app-default border-app-default ">
        {/* Left section: Toggle sidebar */}
        <div className="flex items-center space-x-3">
          {sidebarOpen ? (
            <button onClick={() => setSidebarOpen(false)} aria-label="Close Sidebar">
              <X className="w-5 h-5 text-app-secondary" />
            </button>
          ) : (
            <button onClick={() => setSidebarOpen(true)} aria-label="Open Sidebar">
              <Menu className="w-5 h-5 text-app-secondary" />
            </button>
          )}
        </div>

        {/* Middle: Title */}
        <h1 className="text-l18-semibold text-app-primary dark:text-white">{props.title}</h1>

        {/* Right section: Notification + Theme + Profile */}
        <div className="flex items-center space-x-4">
          <button aria-label="Notifications">
            <Bell className="w-5 h-5 text-app-secondary " />
          </button>
          <ProfilePopover />
        </div>
      </nav>

      {/* Sidebar */}
      <SidebarMobile isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}
