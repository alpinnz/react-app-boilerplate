import { Fragment } from "react";
import { useTranslation } from "react-i18next";

export function UserDashboardPage() {
  const { t } = useTranslation("user");
  return (
    <Fragment>
      <section className="mb-6">
        <h1 className="text-h20-bold mb-6">
          {t("dashboard.header_title", { ns: "user", name: "Alfin" })}
        </h1>
      </section>
    </Fragment>
  );
}
