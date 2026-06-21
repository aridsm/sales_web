"use client";

import AppPage from "../../components/AppPage";
import { useTranslation } from "@/app/utils/i18n";

export default function AccountPage() {
  const { t } = useTranslation();
  return (
    <AppPage title={t("labels.menu.account")}>
      <div>{/* Account content goes here */}</div>
    </AppPage>
  );
}
