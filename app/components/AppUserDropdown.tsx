"use client";

import { useEffect, useState } from "react";
import {
  BusinessOutlined,
  SettingsOutlined,
  ExitToAppOutlined,
} from "@mui/icons-material";
import AppButton from "./AppButton";
import AppDarkModeToggle from "./AppDarkModeToggle";
import AppLanguageSelect from "./AppLanguageSelect";
import { useTranslation } from "@/app/utils/i18n";
import { useRouter, usePathname } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import { useTokenStore } from "@/stores/tokenStore";
import { usersService } from "@/api/services/UserService";
import { getUserInitials } from "@/app/utils/user";

interface AppUserDropdownProps {
  className?: string;
}

export default function AppUserDropdown({ className = "" }: AppUserDropdownProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const clearToken = useTokenStore((state) => state.clearToken);
  const { currentUser, activeCompany } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }

    const mediaQuery =
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(min-width: 900px)")
        : null;

    function handleMediaChange(e: MediaQueryListEvent | MediaQueryList) {
      if (e.matches) {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    mediaQuery?.addEventListener("change", handleMediaChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      mediaQuery?.removeEventListener("change", handleMediaChange);
    };
  }, [isOpen]);

  function handleAvatarClick() {
    if (typeof window !== "undefined" && window.innerWidth < 900) {
      setIsOpen((prev) => !prev);
    } else {
      router.push("/account");
    }
  }

  async function handleLogout() {
    setIsOpen(false);
    try {
      await usersService.logout();
    } finally {
      useUserStore.getState().clearUserData();
      clearToken();
      router.push("/login");
    }
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        title={currentUser?.name || t("labels.header.account")}
        onClick={handleAvatarClick}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="w-8 h-8 rounded-full bg-primary-3 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center text-white text-xs font-semibold shrink-0 shadow-xs cursor-pointer select-none"
      >
        {getUserInitials(currentUser?.name)}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 min-[900px]:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="min-[900px]:hidden absolute right-0 top-full mt-2 w-64 bg-background-2 dark:bg-background-3 border border-border rounded-md shadow-2xl p-3 flex flex-col gap-2.5 z-50 text-foreground">
            {(currentUser?.name || activeCompany?.name) && (
              <div className="py-1 border-b border-border flex flex-col gap-1">
                {currentUser?.name && (
                  <div className={activeCompany ? "pb-2 border-b border-border" : ""}>
                    <p className="text-sm font-medium text-foreground truncate">
                      {currentUser.name}
                    </p>
                    {currentUser.email && (
                      <p className="text-xs text-label truncate">
                        {currentUser.email}
                      </p>
                    )}
                  </div>
                )}

                {activeCompany && (
                  <div
                    title={activeCompany.name}
                    className="flex items-center gap-2 py-2 text-xs select-none"
                  >
                    <BusinessOutlined
                      style={{ fontSize: 16 }}
                      className="text-primary-3 shrink-0"
                    />
                    <span className="truncate text-xs font-medium text-foreground">
                      {activeCompany.name}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs text-foreground font-medium">
                {t("labels.header.theme") || "Tema"}
              </span>
              <AppDarkModeToggle />
            </div>

            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs text-foreground font-medium">
                {t("labels.header.language") || "Idioma"}
              </span>
              <AppLanguageSelect />
            </div>

            <div className="border-t border-border" />

            <AppButton
              flat
              color="transparent"
              onClick={() => {
                setIsOpen(false);
                router.push("/account");
              }}
              className="justify-start"
            >
              <SettingsOutlined fontSize="small"/>
              <span>{t("labels.header.settings") || "Configurações"}</span>
            </AppButton>

            <AppButton
              flat
              color="red"
              onClick={handleLogout}
              className="justify-start border-0"
            >
              <ExitToAppOutlined fontSize="small" />
              <span>{t("labels.menu.logout") || "Sair"}</span>
            </AppButton>
          </div>
        </>
      )}
    </div>
  );
}
