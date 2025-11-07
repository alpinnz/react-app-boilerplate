import { Navigate, Outlet } from "react-router-dom";
import { UserLayout } from "@/shared/components/layout/user_layout/user_layout.tsx";
import { UserDashboardPage } from "@/features/user/pages/user_dashboard_page/user_dashboard_page.tsx";
import type { AppRoute } from "@/shared/types/router.ts";
import { UserAuthRouter } from "@/features/user/user_auth_router.tsx";

export const userRoutes: AppRoute[] = [
  {
    path: "/user",
    element: <UserAuthRouter children={<UserLayout children={<Outlet />} />} />,
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" />,
        handle: { title: "dashboard.page_title", ns: "user" },
      },
      {
        path: "dashboard",
        element: <UserDashboardPage />,
        handle: { title: "dashboard.page_title", ns: "user" },
      },
    ],
  },
];
