import { Controller, useForm } from "react-hook-form";
import { InputField } from "@/shared/components/atomic/input_field.tsx";
import { Button } from "@/shared/components/atomic/button.tsx";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { DataState } from "@/core/models/data_state.ts";
import { authRepository } from "@/features/auth/repositories/auth_repository/auth_repository.ts";
import { handleException } from "@/core/exceptions/handle_exceptions.ts";
import { useToast } from "@/shared/components/common/notification/toast/toast_hook.tsx";

export function ResetPasswordPage() {
  const { email, code } = useParams();
  const { showToast } = useToast();
  const [passwordVisibility, setPasswordVisibility] = React.useState<boolean>(false);
  const [passwordRepeatVisibility, setPasswordRepeatVisibility] = React.useState<boolean>(false);
  const { t } = useTranslation(["auth", "validation"]);
  const navigate = useNavigate();
  const [submitState, setSubmitState] = React.useState<DataState<null>>(DataState.initial());
  const { control, handleSubmit, getValues } = useForm<FormData>({
    defaultValues: {
      password: "",
      password_repeat: "",
    },
    mode: "onBlur",
  });

  type FormData = {
    password: string | null;
    password_repeat: string | null;
  };

  const onSubmit = async (data: FormData) => {
    setSubmitState(DataState.loading());
    try {
      const res = await authRepository.ResetPassword({
        code: code ?? "",
        email: email ?? "",
        password: data.password ?? "",
        password_repeat: data.password_repeat ?? "",
      });

      if (res.isLeft()) {
        throw res.error;
      }

      setSubmitState(DataState.success(null));
      navigate("/auth", { replace: true });
      showToast({ type: "success", message: t("reset_password.success_message", { ns: "auth" }) });
    } catch (err) {
      const exception = handleException(err);
      exception.message = t("reset_password.failure_message", { ns: "auth" });
      setSubmitState(DataState.failure(exception.message));
      showToast({ exception });
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisibility((prev) => !prev);
  };

  const togglePasswordRepeatVisibility = () => {
    setPasswordRepeatVisibility((prev) => !prev);
  };

  return (
    <React.Fragment>
      <h2 className="mt-6 text-center text-h20-bold text-app-primary">
        {t("reset_password.form_title", { ns: "auth" })}
      </h2>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="password"
          control={control}
          rules={{
            required: t("required", {
              ns: "validation",
              field: t("reset_password.password_label", { ns: "auth" }),
            }),
            minLength: {
              value: 6,
              message: t("min_length", {
                ns: "validation",
                field: t("reset_password.password_label", { ns: "auth" }),
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
                return t("must_include", { ns: "validation", include: errors.join(", ") });
              } else {
                return true;
              }
            },
          }}
          render={({ field, fieldState }) => (
            <InputField
              type={passwordVisibility ? "text" : "password"}
              label={t("reset_password.password_label", { ns: "auth" })}
              placeholder={t("reset_password.password_placeholder", { ns: "auth" })}
              value={field.value ?? ""}
              onChange={field.onChange}
              onSubmit={handleSubmit(onSubmit)}
              error={fieldState.error?.message}
              suffix={
                passwordVisibility ? (
                  <Eye size={18} onClick={() => togglePasswordVisibility()} />
                ) : (
                  <EyeOff size={18} onClick={() => togglePasswordVisibility()} />
                )
              }
            />
          )}
        />
        <Controller
          name="password_repeat"
          control={control}
          rules={{
            required: t("required", {
              ns: "validation",
              field: t("reset_password.password_repeat_label", { ns: "auth" }),
            }),
            validate: (value) => {
              return (
                value === getValues("password") || t("passwords_not_match", { ns: "validation" })
              );
            },
          }}
          render={({ field, fieldState }) => (
            <InputField
              type={passwordRepeatVisibility ? "text" : "password"}
              label={t("reset_password.password_repeat_label", { ns: "auth" })}
              placeholder={t("reset_password.password_repeat_placeholder", { ns: "auth" })}
              value={field.value ?? ""}
              onChange={field.onChange}
              onSubmit={handleSubmit(onSubmit)}
              error={fieldState.error?.message}
              suffix={
                passwordRepeatVisibility ? (
                  <Eye size={18} onClick={() => togglePasswordRepeatVisibility()} />
                ) : (
                  <EyeOff size={18} onClick={() => togglePasswordRepeatVisibility()} />
                )
              }
            />
          )}
        />
        <Button
          type="submit"
          loading={submitState.isLoading()}
          label={t("reset_password.button", { ns: "auth" })}
          variant="primary"
          color="primary"
          fullWidth
        />
      </form>
      <p className="mt-6 text-center text-l14-regular text-app-secondary">
        {t("reset_password.have_account", { ns: "auth" })}
        <Link to={"/auth/login"} className="ms-1 text-primary-600 hover:text-primary-500">
          {t("reset_password.login_now", { ns: "auth" })}
        </Link>
      </p>
    </React.Fragment>
  );
}
