import { authRoutes } from "@/features/auth/auth_router.tsx";
import { userRoutes } from "@/features/user/user_router.tsx";
import { type AppRoute, toRouteObjects } from "@/shared/types/router.ts";
import { NotFoundPage } from "@/shared/components/errors/not_found_page.tsx";
import { createBrowserRouter, Outlet } from "react-router-dom";
import { AppCommonRouter } from "@/features/app/providers/app_common/app.common.router.tsx";

export const appRoutes: AppRoute[] = [
  {
    path: "/",
    element: <AppCommonRouter children={<Outlet />} />,
    children: [
      ...authRoutes,
      ...userRoutes,
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
];

//

export const router = createBrowserRouter(toRouteObjects(appRoutes));
