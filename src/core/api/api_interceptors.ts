import {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { env } from "@/core/config/env/env.ts";
import {
  Authorization,
  XApiKey,
  XDevice,
  XLocate,
  XPlatform,
} from "@/core/config/constants/constants.ts";
import { AuthStorageService } from "@/core/services/auth_storage_service.ts";
import { handleUnauthorizedResponse } from "./api_helper.ts";

export async function handleRequestInterceptor(
  config: InternalAxiosRequestConfig
): Promise<InternalAxiosRequestConfig> {
  const headers = new AxiosHeaders({
    "Content-Type": "application/json",
    Accept: "application/json",
    [XApiKey]: env.VITE_API_KEY,
    [XDevice]: "web",
    [XPlatform]: "browser",
    [XLocate]: "0,0",
  });

  if (config.headers) {
    Object.entries(config.headers).forEach(([key, value]) => {
      if (value !== undefined) headers.set(key, value as string);
    });
  }

  const auth = AuthStorageService.get();
  if (auth?.access_token) {
    headers.set(Authorization, `Bearer ${auth.access_token}`);
  }

  config.headers = headers;
  return config;
}

export async function handleResponseInterceptor(response: AxiosResponse): Promise<AxiosResponse> {
  const handled = await handleUnauthorizedResponse(response);
  return handled ?? response;
}

export async function rejectResponseInterceptor(error: AxiosError) {
  const originalRequest = error.config as
    | (InternalAxiosRequestConfig & { _retry?: boolean })
    | undefined;

  const handled = await handleUnauthorizedResponse(error, originalRequest);
  if (handled) return handled;

  return Promise.reject(error);
}
