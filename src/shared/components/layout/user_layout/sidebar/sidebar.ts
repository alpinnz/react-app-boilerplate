import {
  CalendarDays,
  ClipboardList,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Settings,
  User,
  Users,
} from "lucide-react";
import * as React from "react";

export interface SidebarMenuItem {
  key: string;
  label: string;
  icon?: React.ElementType;
  href?: string; // Untuk Next.js / React Router
  onClick?: () => void; // Optional, kalau perlu aksi khusus
  children?: SidebarMenuItem[];
}

export interface SidebarMenuItem {
  key: string;
  label: string; // translation key
  icon?: React.ElementType;
  href?: string;
  onClick?: () => void;
  children?: SidebarMenuItem[];
}

export const SidebarMenuItemData: SidebarMenuItem[] = [
  {
    key: "section-main",
    label: "sidebar.main",
    children: [
      {
        key: "dashboard",
        label: "sidebar.dashboard",
        icon: LayoutDashboard,
        href: "/app/dashboard",
      },
    ],
  },
  {
    key: "section-module",
    label: "sidebar.modules",
    children: [
      {
        key: "module-a",
        label: "sidebar.moduleA",
        icon: FolderOpen,
        children: [
          {
            key: "module-a-list",
            label: "sidebar.moduleA.list",
            href: "/app/module-a/list",
          },
          {
            key: "module-a-create",
            label: "sidebar.moduleA.create",
            href: "/app/module-a/create",
          },
          {
            key: "module-a-categories",
            label: "sidebar.moduleA.categories",
            href: "/app/module-a/categories",
          },
        ],
      },
      {
        key: "module-b",
        label: "sidebar.moduleB",
        icon: ClipboardList,
        children: [
          {
            key: "module-b-active",
            label: "sidebar.moduleB.active",
            href: "/app/module-b/active",
          },
          {
            key: "module-b-archived",
            label: "sidebar.moduleB.archived",
            href: "/app/module-b/archived",
          },
        ],
      },
      {
        key: "module-c",
        label: "sidebar.moduleC",
        icon: FileText,
        children: [
          {
            key: "module-c-upcoming",
            label: "sidebar.moduleC.upcoming",
            href: "/app/module-c/upcoming",
          },
          {
            key: "module-c-history",
            label: "sidebar.moduleC.history",
            href: "/app/module-c/history",
          },
        ],
      },
    ],
  },
  {
    key: "section-community",
    label: "sidebar.community",
    children: [
      {
        key: "users",
        label: "sidebar.users",
        icon: Users,
        children: [
          {
            key: "user-list",
            label: "sidebar.users.list",
            href: "/app/users",
          },
          {
            key: "user-stats",
            label: "sidebar.users.stats",
            href: "/app/users/stats",
          },
        ],
      },
      {
        key: "events",
        label: "sidebar.events",
        icon: CalendarDays,
        children: [
          {
            key: "event-calendar",
            label: "sidebar.events.calendar",
            href: "/app/events/calendar",
          },
          {
            key: "event-webinars",
            label: "sidebar.events.webinars",
            href: "/app/events/webinars",
          },
        ],
      },
    ],
  },
  {
    key: "section-account",
    label: "sidebar.account",
    children: [
      {
        key: "profile",
        label: "sidebar.profile",
        icon: User,
        href: "/app/profile",
      },
      {
        key: "settings",
        label: "sidebar.settings",
        icon: Settings,
        children: [
          {
            key: "account-settings",
            label: "sidebar.account.settings",
            href: "/app/settings/account",
          },
          {
            key: "preferences",
            label: "sidebar.account.preferences",
            href: "/app/settings/preferences",
          },
        ],
      },
    ],
  },
];
