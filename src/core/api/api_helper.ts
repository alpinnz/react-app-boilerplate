import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { AuthStorageService } from "@/core/services/auth_storage_service.ts";
import { authStore } from "@/features/app/providers/auth";
import { authRepository } from "@/features/auth/repositories/auth_repository/auth_repository.ts";

export async function handleUnauthorizedResponse(
  errorOrResponse: AxiosResponse | AxiosError,
  originalRequest?: InternalAxiosRequestConfig & { _retry?: boolean }
) {
  const status =
    "status" in errorOrResponse ? errorOrResponse.status : errorOrResponse.response?.status;

  if (![401, 403].includes(status ?? 0)) {
    return null;
  }

  const auth = AuthStorageService.get();
  if (!auth) {
    clearAuth();
    return Promise.reject(errorOrResponse);
  }

  if (originalRequest && originalRequest._retry) {
    clearAuth();
    return Promise.reject(errorOrResponse);
  }

  if (originalRequest) originalRequest._retry = true;

  try {
    const res = await authRepository.Refresh(auth);
    if (res.isLeft()) throw res.error;

    const newAuth = res.value;
    AuthStorageService.save(newAuth);

    if (originalRequest) {
      originalRequest.headers.set("Authorization", `Bearer ${newAuth.access_token}`);
      return axios(originalRequest);
    }

    return null;
  } catch (refreshError) {
    clearAuth();
    return Promise.reject(refreshError);
  }
}

export function clearAuth() {
  try {
    authStore.getState().logout();
  } catch (e) {
    console.error("[Api] clearAuth error", e);
  }
}
