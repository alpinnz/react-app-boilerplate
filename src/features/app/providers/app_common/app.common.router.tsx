import { useAppEffectProvider } from "@/features/app/providers/app_common/app.common.provider.tsx";
import * as React from "react";

interface AppCommonRouterProps {
  children: React.ReactNode;
}

export function AppCommonRouter(props: AppCommonRouterProps) {
  useAppEffectProvider();

  return props.children;
}
