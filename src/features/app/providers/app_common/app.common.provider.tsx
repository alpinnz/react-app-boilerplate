// /src/app/core/effects/useAppEffectProvider.ts
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppCommonEffect } from "./app.common.effect.ts";
import { useToast } from "@/shared/components/common/notification/toast/toast_hook.tsx";

export function useAppEffectProvider() {
  const navigate = useNavigate();
  const { showToast: toast } = useToast();

  useEffect(() => {
    AppCommonEffect.set({ navigate, toast: toast });
  }, [navigate, toast]);
}
