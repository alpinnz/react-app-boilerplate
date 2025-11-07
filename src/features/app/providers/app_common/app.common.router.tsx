import { useAppEffectProvider } from "@/features/app/providers/app_common/app.common.provider.tsx";
import * as React from "react";
import { useAuthContext } from "@/features/app/providers/auth";

interface AppCommonRouterProps {
  children: React.ReactNode;
}

export function AppCommonRouter(props: AppCommonRouterProps) {
  const authState = useAuthContext((state) => state);
  useAppEffectProvider();

  if (authState.initialLoading) {
    return <div>initial loading</div>;
  }

  return props.children;
}
