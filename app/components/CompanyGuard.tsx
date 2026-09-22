"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import { useTokenStore } from "@/stores/tokenStore";
import { useTranslation } from "@/app/utils/i18n";
import AppHeader from "./AppHeader";
import AppButton from "./AppButton";
import AppLoading from "./AppLoading";
import { BusinessOutlined } from "@mui/icons-material";

export default function CompanyGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const token = useTokenStore((state) => state.token);
  const { currentUser, loading, fetchUserData } = useUserStore();

  const isAccountPage = pathname?.startsWith("/account");

  useEffect(() => {
    if (token && !currentUser && !loading) {
      fetchUserData();
    }
  }, [token, currentUser, loading, fetchUserData]);

  if (isAccountPage) {
    return <>{children}</>;
  }

  if (token && (!currentUser || loading)) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <AppLoading />
      </div>
    );
  }

  if (currentUser && !currentUser.company_id) {
    return (
      <div className="flex flex-col min-h-0 flex-1 h-full">
        <AppHeader title={t("labels.no_active_company.title")} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="border border-border bg-background-2 dark:bg-background-3/50 rounded-xs p-8 max-w-md w-full text-center shadow-xs">
            <div className="w-16 h-16 rounded-xs bg-primary-3/10 text-primary-3 flex items-center justify-center mx-auto mb-4">
              <BusinessOutlined style={{ fontSize: 32 }} />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              {t("labels.no_active_company.title")}
            </h2>
            <p className="text-sm text-foreground-3 mb-6 leading-relaxed">
              {t("labels.no_active_company.message")}
            </p>
            <AppButton
              onClick={() => router.push("/account")}
              className="mx-auto justify-center"
            >
              {t("labels.no_active_company.action_button")}
            </AppButton>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
