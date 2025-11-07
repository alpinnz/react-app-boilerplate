import { AuthLayout } from "@/shared/components/layout/auth_layout.tsx";
import { Navigate, Outlet } from "react-router-dom";
import { LoginPage } from "./pages/login_page/login_page.tsx";
import { RegisterPage } from "@/features/auth/pages/register_page/register_page.tsx";
import { ForgotPasswordPage } from "./pages/forgot_password_page/forgot_password_page.tsx";
import { ResetPasswordPage } from "@/features/auth/pages/reset_password_page/reset_password_page.tsx";
import type { AppRoute } from "@/shared/types/router.ts";
import { AccountActivationPage } from "@/features/auth/pages/account_activation_page/account_activation_page.tsx";
import { AuthCommonRouter } from "@/features/auth/auth_common_router.tsx";

export const authRoutes: AppRoute[] = [
  {
    path: "/auth",
    element: <AuthCommonRouter children={<AuthLayout children={<Outlet />} />} />,
    children: [
      {
        index: true,
        element: <Navigate to="login" />,
      },
      {
        path: "login",
        element: <LoginPage />,
        handle: { title: "login.page_title", ns: "auth" },
      },
      {
        path: "register",
        element: <RegisterPage />,
        handle: { title: "register.page_title", ns: "auth" },
      },
      {
        path: "forgot-password",
        element: <ForgotPasswordPage />,
        handle: { title: "forgot_password.page_title", ns: "auth" },
      },
      {
        path: "account_activation",
        element: <AccountActivationPage />,
        handle: { title: "account_activation.page_title", ns: "auth" },
      },
      {
        path: "reset-password/:email/:code",
        element: <ResetPasswordPage />,
        handle: { title: "new_password.page_title", ns: "auth" },
      },
    ],
  },
];
