import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
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
import { authStore } from "@/features/app/providers/auth";

export class ApiClient {
  private static async handleRequestInterceptor(config: InternalAxiosRequestConfig) {
    const headers = new AxiosHeaders();

    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");
    headers.set(XApiKey, env.VITE_API_KEY);

    const auth = AuthStorageService.get();

    if (auth != null) {
      try {
        const accessToken = auth?.access_token ?? "";
        headers.set(Authorization, accessToken);
      } catch (e) {
        console.error("[Api] handleRequestInterceptor error", e);
      }
    }

    headers.set(XDevice, "web");
    headers.set(XPlatform, "browser");
    headers.set(XLocate, "0,0");

    config.headers = headers;

    return config;
  }

  private static async handleResponseInterceptor(response: AxiosResponse): Promise<AxiosResponse> {
    if (response?.status === 401 || response?.status === 403) {
      ApiClient.clearAuth();
    }
    return response;
  }

  private static async rejectResponseInterceptor(error: AxiosError) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      ApiClient.clearAuth();
    }
    throw error;
  }

  private static clearAuth() {
    try {
      AuthStorageService.clear();
      authStore.getState().logout();
    } catch (e) {
      console.error("[Api] clearAuth error", e);
    }
  }

  public static reqV1Json(): AxiosInstance {
    const client: AxiosInstance = axios.create({
      baseURL: env.VITE_API_URL,
      timeout: env.VITE_API_TIMEOUT ?? 60000,
      validateStatus: () => true,
    });

    client.interceptors.request.use(this.handleRequestInterceptor);
    client.interceptors.response.use(
      this.handleResponseInterceptor,
      this.rejectResponseInterceptor
    );

    return client;
  }
}
