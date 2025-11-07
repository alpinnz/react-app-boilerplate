import { Button } from "@/shared/components/atomic/button.tsx";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as React from "react";

export function AccountActivationPage() {
  const { t } = useTranslation("auth");

  return (
    <React.Fragment>
      <h2 className="mt-6 text-center text-h20-bold text-app-primary">
        {t("account_activation.form_title")}
      </h2>
      <div className="mt-8 text-center text-l16-regular text-app-primary-900">
        {t("account_activation.success_message")}
      </div>

      <div className="mt-8">
        <Link to="/auth/login">
          <Button
            type="button"
            label={t("account_activation.login_button")}
            variant="primary"
            color="primary"
            fullWidth
          />
        </Link>
      </div>
    </React.Fragment>
  );
}
