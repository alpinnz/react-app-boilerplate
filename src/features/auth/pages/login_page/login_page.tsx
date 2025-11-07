import { Controller, useForm } from "react-hook-form";
import { InputField } from "@/shared/components/atomic/input_field.tsx";
import { Button } from "@/shared/components/atomic/button.tsx";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/shared/components/common/notification/toast/toast_hook.tsx";
import { handleException } from "@/core/exceptions/handle_exceptions.ts";
import { authRepository } from "@/features/auth/repositories/auth_repository/auth_repository.ts";
import { DataState } from "@/core/models/data_state.ts";
import { useAuthContext } from "@/features/app/providers/auth";

export function LoginPage() {
  const { showToast } = useToast();
  const [passwordVisibility, setPasswordVisibility] = React.useState(false);
  const { t } = useTranslation(["auth", "validation"]);
  const navigate = useNavigate();
  const [submitState, setSubmitState] = React.useState<DataState<null>>(DataState.initial());
  const authState = useAuthContext((state) => state);

  type FormData = {
    email: string | null;
    password: string | null;
  };

  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      email: "alpinnz@gmail.com",
      password: "!Password123",
    },
    mode: "onBlur",
  });

  const togglePasswordVisibility = () => {
    setPasswordVisibility((prev) => !prev);
  };

  const onSubmit = async (data: FormData) => {
    setSubmitState(DataState.loading());
    try {
      const { email, password } = data;
      const res = await authRepository.Login({
        email: email ?? "",
        password: password ?? "",
      });

      if (res.isLeft()) {
        throw res.error;
      }
      if (res.isRight()) {
        authState.login(res.value);
        console.log(res.value);
        showToast({ type: "success", message: t("login.success_message", { ns: "auth" }) });
        setSubmitState(DataState.success(null));
        navigate("/user/dashboard", { replace: true });
      }
    } catch (err) {
      const exception = handleException(err);
      exception.message = t("login.failure_message", { ns: "auth" });
      setSubmitState(DataState.failure(exception.message));
      showToast({ exception });
    }
  };

  return (
    <React.Fragment>
      {/* Title */}
      <h2 className="mt-6 text-center text-h20-bold text-app-primary">
        {t("login.form_title", { ns: "auth" })}
      </h2>

      {/* Form */}
      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Email Field */}
        <Controller
          name="email"
          control={control}
          rules={{
            required: t("required", {
              ns: "validation",
              field: t("login.email_label", { ns: "auth" }),
            }),
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: t("email", {
                ns: "validation",
                field: t("login.email_label", { ns: "auth" }),
              }),
            },
          }}
          render={({ field, fieldState }) => (
            <InputField
              type="text"
              label={t("login.email_label", { ns: "auth" })}
              placeholder={t("login.email_placeholder", { ns: "auth" })}
              value={field.value ?? ""}
              onChange={field.onChange}
              onSubmit={handleSubmit(onSubmit)}
              error={fieldState.error?.message}
            />
          )}
        />

        {/* Password Field */}
        <Controller
          name="password"
          control={control}
          rules={{
            required: t("required", {
              ns: "validation",
              field: t("login.password_label", { ns: "auth" }),
            }),
            minLength: {
              value: 6,
              message: t("min_length", {
                ns: "validation",
                field: t("login.password_label", { ns: "auth" }),
                length: "6",
              }),
            },
            validate: (value) => {
              const errors = [];
              if (!/[a-z]/.test(value ?? "")) {
                errors.push(t("include_lowercase", { ns: "validation" }));
              }
              if (!/[A-Z]/.test(value ?? "")) {
                errors.push(t("include_uppercase", { ns: "validation" }));
              }
              if (!/[0-9]/.test(value ?? "")) {
                errors.push(t("include_number", { ns: "validation" }));
              }
              if (!/[!@#$%^&*(),.?":{}|<>[\]\\/~`_\-+=]/.test(value ?? "")) {
                errors.push(t("include_symbol", { ns: "validation" }));
              }
              if (errors.length > 0) {
                return t("must_include", {
                  ns: "validation",
                  include: errors.join(", "),
                });
              }
              return true;
            },
          }}
          render={({ field, fieldState }) => (
            <InputField
              type={passwordVisibility ? "text" : "password"}
              label={t("login.password_label", { ns: "auth" })}
              placeholder={t("login.password_placeholder", { ns: "auth" })}
              value={field.value ?? ""}
              onChange={field.onChange}
              onSubmit={handleSubmit(onSubmit)}
              error={fieldState.error?.message}
              suffix={
                passwordVisibility ? (
                  <Eye
                    size={18}
                    onClick={togglePasswordVisibility}
                    className="cursor-pointer text-app-icon"
                  />
                ) : (
                  <EyeOff
                    size={18}
                    onClick={togglePasswordVisibility}
                    className="cursor-pointer text-app-icon"
                  />
                )
              }
            />
          )}
        />

        {/* Forgot Password */}
        <div className="flex justify-end">
          <Link to="/auth/forgot-password" className="text-sm text-app-link hover:underline">
            {t("login.forgot_password", { ns: "auth" })}
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          loading={submitState.isLoading()}
          label={t("login.button", { ns: "auth" })}
          variant="primary"
          color="primary"
          fullWidth
        />
      </form>

      {/* Register Link */}
      <p className="mt-6 text-center text-l14-regular text-app-secondary">
        {t("login.no_account", { ns: "auth" })}{" "}
        <Link to="/auth/register" className="ms-1 text-app-link hover:underline">
          {t("login.register_now", { ns: "auth" })}
        </Link>
      </p>
    </React.Fragment>
  );
}
