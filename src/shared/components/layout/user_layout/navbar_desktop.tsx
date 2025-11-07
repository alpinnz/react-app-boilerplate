import { Bell } from "lucide-react";
import { ProfilePopover } from "@/shared/components/layout/user_layout/profile_popover.tsx";

interface NavbarDesktopProps {
  title?: string;
}

export function NavbarDesktop(props: NavbarDesktopProps) {
  return (
    <header className="flex justify-between items-center px-6 py-4 bg-app-default border-b border-app-default shadow-sm dark:shadow-md">
      <h1 className="text-l18-semibold text-app-primary tracking-tight">{props.title}</h1>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg hover:bg-app-muted bg-app-surface-default transition-colors">
          <Bell className="w-5 h-5 text-app-secondary" />
        </button>
        <ProfilePopover />
      </div>
    </header>
  );
}
