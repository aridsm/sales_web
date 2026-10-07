"use client";

import { useEffect, useState } from "react";
import {
  NotificationsOutlined,
  BusinessOutlined,
  Menu as MenuIcon,
} from "@mui/icons-material";
import AppButton from "./AppButton";
import AppDarkModeToggle from "./AppDarkModeToggle";
import AppLanguageSelect from "./AppLanguageSelect";
import AppUserDropdown from "./AppUserDropdown";
import { useTranslation } from "@/app/utils/i18n";
import { useUserStore } from "@/stores/userStore";
import { useTokenStore } from "@/stores/tokenStore";
import { useMobileMenuStore } from "@/stores/mobileMenuStore";
import { getImageUrl } from "@/app/utils/image";

interface AppHeaderProps {
  title: string;
}

function formatShortName(name: string | undefined | null, max = 20) {
  if (!name) return "";
  const trimmed = name.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}...`;
}

export default function AppHeader({ title }: AppHeaderProps) {
  const { t } = useTranslation();
  const token = useTokenStore((state) => state.token);
  const { currentUser, activeCompany, fetchUserData } = useUserStore();
  const toggleMobileMenu = useMobileMenuStore(
    (state) => state.toggleMobileMenu,
  );
  const [logoError, setLogoError] = useState(false);
  const companyLogoUrl = getImageUrl(activeCompany?.logo_url);

  useEffect(() => {
    setLogoError(false);
  }, [activeCompany?.logo_url, activeCompany?.id]);

  useEffect(() => {
    if (token && !currentUser) {
      fetchUserData();
    }
  }, [token, currentUser, fetchUserData]);

  return (
    <div className="flex items-center sticky top-0 z-50 justify-between border-b border-border py-2 sm:py-3 transition-colors bg-background-2 dark:bg-background">
      <div className="max-w-400 w-full flex items-center justify-between mx-auto px-2 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <AppButton
            rounded
            flat
            color="transparent"
            onClick={toggleMobileMenu}
            className="w-9 h-9 text-foreground hover:text-foreground shrink-0 min-[1250px]:hidden"
            title={t("labels.menu.open_menu") || "Abrir menu"}
            aria-label={t("labels.menu.open_menu") || "Abrir menu"}
          >
            <MenuIcon fontSize="small" />
          </AppButton>
          <h1 className="text-base sm:text-lg min-[900px]:text-xl font-semibold text-foreground transition-colors truncate">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2 min-[900px]:gap-3 shrink-0">
          <div className="hidden min-[900px]:flex items-center">
            <AppDarkModeToggle />
          </div>
          <div className="hidden min-[900px]:flex items-center">
            <AppLanguageSelect />
          </div>

          <AppButton
            rounded
            flat
            color="transparent"
            title={t("labels.header.notifications")}
            className="w-9 h-9 text-foreground hover:text-foreground"
          >
            <NotificationsOutlined fontSize="small" />
          </AppButton>

          <div className="h-4 w-px bg-border hidden min-[900px]:block" />

          {activeCompany && (
            <div
              title={activeCompany.name}
              className="hidden min-[900px]:flex items-center gap-1.5 px-2.5 h-9 text-xs font-medium text-foreground select-none"
            >
              {companyLogoUrl && !logoError ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={companyLogoUrl}
                  alt={activeCompany.name}
                  onError={() => setLogoError(true)}
                  className="w-6.5 h-6.5 rounded-xs object-cover shrink-0"
                />
              ) : (
                <BusinessOutlined
                  style={{ fontSize: 18 }}
                  className="text-primary shrink-0"
                />
              )}
              <span className="truncate max-w-[90px] sm:max-w-[140px] md:max-w-[180px]">
                {formatShortName(activeCompany.name, 30)}
              </span>
            </div>
          )}

          {activeCompany && (
            <div className="h-4 w-px bg-border hidden min-[900px]:block" />
          )}

          <AppUserDropdown />
        </div>
      </div>
    </div>
  );
}
