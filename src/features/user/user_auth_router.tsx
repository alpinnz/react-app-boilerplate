import { Navigate } from "react-router-dom";
import * as React from "react";
import { useAuthContext } from "@/features/app/providers/auth";

interface UserAuthRouterProps {
  children: React.ReactNode;
}

export function UserAuthRouter(props: UserAuthRouterProps) {
  const user = useAuthContext((state) => state.auth?.user);

  if (user?.roles?.some((e) => e.name?.toLowerCase() == "user")) {
    return props.children;
  }

  return <Navigate to="/auth/login" />;
}
