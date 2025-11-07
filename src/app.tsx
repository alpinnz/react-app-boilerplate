import { RouterProvider } from "react-router-dom";
import { ToastProvider } from "@/shared/components/common/notification/toast/toast_provider.tsx";
import { router } from "@/core/router/app_router.tsx";
import { AuthProvider } from "@/features/app/providers/auth";

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ToastProvider>
  );
}
