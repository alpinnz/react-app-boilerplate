import { Navigate } from "react-router-dom";
import { AuthStorageService } from "@/core/services/auth_storage_service.ts";
import * as React from "react";

interface AuthCommonRouterProps {
  children: React.ReactNode;
}

export function AuthCommonRouter(props: AuthCommonRouterProps) {
  const auth = AuthStorageService.get();
  if (auth != null) {
    if (auth?.user?.roles?.some((e) => e.name?.toLowerCase() === "user")) {
      return <Navigate to="/user/dashboard" />;
    }
    if (auth?.user?.roles?.some((e) => e.name?.toLowerCase() === "admin")) {
      return <Navigate to="/admin/dashboard" />;
    }
  }
  return props.children;
}
