import { Controller, useForm } from "react-hook-form";
import { InputField } from "@/shared/components/atomic/input_field.tsx";
import { Button } from "@/shared/components/atomic/button.tsx";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as React from "react";
import { authRepository } from "@/features/auth/repositories/auth_repository/auth_repository.ts";
import { handleException } from "@/core/exceptions/handle_exceptions.ts";
import { useToast } from "@/shared/components/common/notification/toast/toast_hook.tsx";
import { DataState } from "@/core/models/data_state.ts";

export function ForgotPasswordPage() {
  const { showToast } = useToast();
  const { t } = useTranslation(["auth", "validation"]);
  const navigate = useNavigate();
  const [submitState, setSubmitState] = React.useState<DataState<null>>(DataState.initial());

  type FormData = {
    email: string | null;
  };

  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      email: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: FormData) => {
    setSubmitState(DataState.loading());
    try {
      const res = await authRepository.ForgotPassword({
        email: data.email ?? "",
      });

      if (res.isLeft()) {
        throw res.error;
      }

      setSubmitState(DataState.success(null));
      navigate("/auth", { replace: true });
      showToast({ type: "success", message: t("forgot_password.success_message", { ns: "auth" }) });
    } catch (err) {
      const exception = handleException(err);
      exception.message = t("forgot_password.failure_message", { ns: "auth" });
      setSubmitState(DataState.failure(exception.message));
      showToast({ exception });
    }
  };

  return (
    <React.Fragment>
      <h2 className="mt-6 text-center text-h20-bold text-app-primary">
        {t("forgot_password.form_title", { ns: "auth" })}
      </h2>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="email"
          control={control}
          rules={{
            required: t("required", {
              ns: "validation",
              field: t("forgot_password.email_label", { ns: "auth" }),
            }),
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: t("email", {
                ns: "validation",
                field: t("forgot_password.email_label", { ns: "auth" }),
              }),
            },
          }}
          render={({ field, fieldState }) => (
            <InputField
              type="text"
              label={t("forgot_password.email_label", { ns: "auth" })}
              placeholder={t("forgot_password.email_placeholder", { ns: "auth" })}
              value={field.value ?? ""}
              onChange={field.onChange}
              onSubmit={handleSubmit(onSubmit)}
              error={fieldState.error?.message}
            />
          )}
        />
        <Button
          type="submit"
          loading={submitState.isLoading()}
          label={t("forgot_password.button", { ns: "auth" })}
          variant="primary"
          color="primary"
          fullWidth
        />
      </form>

      <p className="mt-6 text-center text-l14-regular text-app-secondary">
        {t("forgot_password.remember_password", { ns: "auth" })}
        <Link to={"/auth/login"} className="ms-1 text-primary-600 hover:text-primary-500">
          {t("forgot_password.login_now", { ns: "auth" })}
        </Link>
      </p>
    </React.Fragment>
  );
}
