// src/services/AuthStorageService.ts

import { AUTH_STORAGE_KEY } from "@/core/config/constants/constants.ts";
import type { Auth } from "@/core/models/auth.ts";

export class AuthStorageService {
  static save(auth: Auth): void {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    } catch (error) {
      console.error("Failed to save auth data:", error);
    }
  }

  static get(): Auth | null {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Auth) : null;
    } catch (error) {
      console.error("Failed to parse auth data:", error);
      return null;
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear auth data:", error);
    }
  }

  static getAccessToken(): string | null {
    return this.get()?.access_token ?? null;
  }

  static getRefreshToken(): string | null {
    return this.get()?.refresh_token ?? null;
  }

  static isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token;
  }
}
