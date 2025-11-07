import { ApiClient } from "@/core/api/api_client.ts";
import { handleError } from "@/core/errors/errors_handler.ts";
import type { Auth } from "@/core/models/auth.ts";
import { type Either, Left, Right } from "@/core/errors/either.ts";
import type { AuthRepository } from "@/features/auth/repositories/auth_repository/auth_repository.ts";
import type { ApiResponse } from "@/core/api/api_response.ts";
import { AuthStorageService } from "@/core/services/auth_storage_service.ts";
import type { AuthLoginRequest } from "@/features/auth/requests/auth_login_request.ts";
import type { AuthRegisterRequest } from "@/features/auth/requests/auth_register_request.ts";
import type { AuthRefreshRequest } from "@/features/auth/requests/auth_refresh_request.ts";
import type { AuthLogoutRequest } from "@/features/auth/requests/auth_logout_request.ts";
import type { AuthForgotPasswordRequest } from "@/features/auth/requests/auth_forgot_password_request.ts";
import type { AuthResetPasswordRequest } from "@/features/auth/requests/auth_reset_password_request.ts";

export class AuthRepositoryImpl implements AuthRepository {
  async Login(data: AuthLoginRequest): Promise<Either<Error, Auth>> {
    try {
      const res = await ApiClient.reqV1Json().post<ApiResponse<Auth>>("/api/v1/auth/login", data);

      if (res.status === 200) {
        return Right.create(res.data.data);
      }

      return Left.create(new Error(res.data?.message));
    } catch (err: unknown) {
      return Left.create(handleError(err));
    }
  }

  async Register(data: AuthRegisterRequest): Promise<Either<Error, Auth>> {
    try {
      const res = await ApiClient.reqV1Json().post<ApiResponse<Auth>>(
        "/api/v1/auth/register",
        data
      );

      if (res.status === 201) {
        return Right.create(res.data.data);
      }

      return Left.create(new Error(res.data?.message));
    } catch (err: unknown) {
      return Left.create(handleError(err));
    }
  }

  async Refresh(data: AuthRefreshRequest): Promise<Either<Error, Auth>> {
    try {
      const res = await ApiClient.reqV1Json().post<ApiResponse<Auth>>("/api/v1/auth/refresh", data);

      if (res.status === 200) {
        return Right.create(res.data.data);
      }

      return Left.create(new Error(res.data?.message));
    } catch (err: unknown) {
      return Left.create(handleError(err));
    }
  }

  async ForgotPassword(data: AuthForgotPasswordRequest): Promise<Either<Error, boolean>> {
    try {
      const res = await ApiClient.reqV1Json().post<ApiResponse<boolean>>(
        "/api/v1/auth/forgot-password",
        data
      );

      if (res.status === 200) {
        return Right.create(res.data.data);
      }

      return Left.create(new Error(res.data?.message));
    } catch (err: unknown) {
      return Left.create(handleError(err));
    }
  }

  async ResetPassword(data: AuthResetPasswordRequest): Promise<Either<Error, Auth>> {
    try {
      const res = await ApiClient.reqV1Json().post<ApiResponse<Auth>>(
        "/api/v1/auth/reset-password",
        data
      );

      if (res.status === 200) {
        return Right.create(res.data.data);
      }

      return Left.create(new Error(res.data?.message));
    } catch (err: unknown) {
      return Left.create(handleError(err));
    }
  }

  async Logout(data: AuthLogoutRequest): Promise<Either<Error, null>> {
    try {
      const res = await ApiClient.reqV1Json().post<ApiResponse<Auth>>("/api/v1/auth/logout", data);

      if (res.status === 200) {
        return Right.create(null);
      }

      return Left.create(new Error(res.data?.message));
    } catch (err: unknown) {
      return Left.create(handleError(err));
    }
  }

  async SaveAuth(auth: Auth): Promise<Either<Error, null>> {
    try {
      AuthStorageService.save(auth);
      return Right.create(null);
    } catch (err: unknown) {
      return Left.create(handleError(err));
    }
  }

  async GetAuth(): Promise<Either<Error, Auth>> {
    try {
      const auth = AuthStorageService.get();
      if (auth != null) {
        return Right.create(auth);
      }
      return Left.create(Error("Authentication failed"));
    } catch (err: unknown) {
      return Left.create(handleError(err));
    }
  }

  async ClearAuth(): Promise<Either<Error, null>> {
    try {
      AuthStorageService.clear();
      return Right.create(null);
    } catch (err: unknown) {
      return Left.create(handleError(err));
    }
  }
}
