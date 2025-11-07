import { injector } from "@/core/config/di/injector.ts";
import type { Auth } from "@/core/models/auth.ts";
import type { Either } from "@/core/errors/either.ts";
import type { AuthLoginRequest } from "@/features/auth/requests/auth_login_request.ts";
import type { AuthRegisterRequest } from "@/features/auth/requests/auth_register_request.ts";
import type { AuthLogoutRequest } from "@/features/auth/requests/auth_logout_request.ts";
import type { AuthRefreshRequest } from "@/features/auth/requests/auth_refresh_request.ts";
import type { AuthResetPasswordRequest } from "@/features/auth/requests/auth_reset_password_request.ts";
import type { AuthForgotPasswordRequest } from "@/features/auth/requests/auth_forgot_password_request.ts";

export const authRepository = injector.resolve<AuthRepository>("authRepository");

export interface AuthRepository {
  Login(data: AuthLoginRequest): Promise<Either<Error, Auth>>;

  Register(data: AuthRegisterRequest): Promise<Either<Error, Auth>>;

  Logout(data: AuthLogoutRequest): Promise<Either<Error, null>>;

  Refresh(data: AuthRefreshRequest): Promise<Either<Error, Auth>>;

  ForgotPassword(data: AuthForgotPasswordRequest): Promise<Either<Error, boolean>>;

  ResetPassword(data: AuthResetPasswordRequest): Promise<Either<Error, Auth>>;

  SaveAuth(auth: Auth): Promise<Either<Error, null>>;

  ClearAuth(): Promise<Either<Error, null>>;

  GetAuth(): Promise<Either<Error, Auth>>;
}
