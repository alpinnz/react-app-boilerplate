import { RouterProvider } from "react-router-dom";
import { ToastProvider } from "@/shared/components/common/notification/toast/toast_provider.tsx";
import { router } from "@/core/router/app_router.tsx";
import { AuthProvider } from "@/features/app/providers/auth";

export function App() {
  // const apiUrl = import.meta.env.VITE_API_URL;
  // const apiKey = import.meta.env.VITE_API_KEY;
  //
  // console.log('API URL:', apiUrl);
  // console.log('API Key:', apiKey);
  //
  // if (loading) {
  //     return (
  //         <div className="flex min-h-screen items-center justify-center px-4 py-12">
  //             <div className="flex flex-col items-center">
  //                 <img className="h-24 w-auto" src={Logo} alt="Company"/>
  //             </div>
  //         </div>
  //     )
  // }
  return (
    <ToastProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ToastProvider>
  );
}
