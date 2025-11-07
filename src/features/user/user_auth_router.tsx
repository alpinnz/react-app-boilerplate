import { Navigate } from "react-router-dom";
import * as React from "react";
import { useAuthContext } from "@/features/app/providers/auth";

interface UserAuthRouterProps {
  children: React.ReactNode;
}

export function UserAuthRouter(props: UserAuthRouterProps) {
  const initial = useAuthContext((state) => state.initial);
  const authState = useAuthContext((state) => state);

  React.useEffect(() => {
    initial();
  }, [initial]);

  if (authState.auth?.user?.roles?.some((e) => e.name?.toLowerCase() === "user")) {
    return props.children;
  }

  return <Navigate to="/auth/login" />;
}
