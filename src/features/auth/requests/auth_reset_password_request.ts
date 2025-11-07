export interface AuthResetPasswordRequest {
  code: string;
  email: string;
  password: string;
  password_repeat: string;
}
