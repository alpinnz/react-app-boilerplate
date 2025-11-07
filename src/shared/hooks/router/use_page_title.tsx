import { useMatches } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Handle } from "@/shared/types/router.ts";

export function usePageTitle(): string {
  const matches = useMatches();
  const { t } = useTranslation();

  const matchWithTitle = matches.find((match) => {
    return typeof match.handle === "object" && match.handle !== null && "title" in match.handle;
  });

  if (!matchWithTitle) return "";

  const title = (matchWithTitle?.handle as Handle)?.title ?? "";
  const ns = (matchWithTitle?.handle as Handle)?.ns ?? "";

  if (ns != "") {
    return t(title, { ns });
  }

  return title;
}
