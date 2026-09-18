"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTokenStore } from "@/stores/tokenStore";
import { useMobileMenuStore } from "@/stores/mobileMenuStore";
import { usersService } from "@/api/services/UserService";
import {
  History,
  ShoppingCartOutlined,
  DashboardOutlined,
  Inventory2Outlined,
  ReceiptOutlined,
  AccountCircleOutlined,
  CategoryOutlined,
  LocalShippingOutlined,
  Close as CloseIcon,
  Menu as MenuIcon,
  ExitToAppOutlined,
} from "@mui/icons-material";
import AppButton from "./AppButton";
import AppDarkModeToggle from "./AppDarkModeToggle";
import AppLanguageSelect from "./AppLanguageSelect";
import AppLogo from "./AppLogo";
import { useTranslation } from "@/app/utils/i18n";
import { useUserStore } from "@/stores/userStore";

interface MenuItem {
  key: string;
  href: string;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
}

const menuItems: MenuItem[] = [
  { key: "dashboard", href: "/", icon: DashboardOutlined },
  { key: "categories", href: "/categories", icon: CategoryOutlined },
  { key: "products", href: "/products", icon: Inventory2Outlined },
  { key: "sales", href: "/sales", icon: ShoppingCartOutlined },
  { key: "stock_entries", href: "/stock-entries", icon: LocalShippingOutlined },
  { key: "history", href: "/history", icon: History },
  { key: "other_expenses", href: "/other_expenses", icon: ReceiptOutlined },
  { key: "account", href: "/account", icon: AccountCircleOutlined },
];

function isItemActive(href: string, pathname: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}

function KivoLogo({
  textColor = "text-white",
}: {
  textColor?: string;
  iconColor?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 pl-1">
      <AppLogo className="w-6 h-6 shrink-0" color="var(--primary, #aeec1c)" />
      <span className={`text-base font-bold tracking-wide ${textColor}`}>
        Kivo
      </span>
    </div>
  );
}

function MenuList({
  items,
  pathname,
  isOpen,
  variant,
  onItemClick,
}: {
  items: MenuItem[];
  pathname: string;
  isOpen: boolean;
  variant: "desktop" | "mobile";
  onItemClick?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => {
        const isActive = isItemActive(item.href, pathname);
        const Icon = item.icon;

        const inactiveClasses =
          variant === "desktop"
            ? "text-white/70 hover:bg-zinc-500/15 dark:hover:bg-background-2 hover:text-white"
            : "text-foreground/70 hover:bg-background-3 dark:hover:bg-background-2 hover:text-foreground";

        return (
          <li key={item.key} className="w-full">
            <Link
              href={item.href}
              onClick={onItemClick}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 h-12 rounded-md transition-colors duration-200 ${
                isOpen ? "px-3" : "justify-center"
              } ${isActive ? "bg-primary text-black font-normal" : inactiveClasses}`}
            >
              <div className="w-5 min-w-5 flex items-center justify-center">
                <Icon style={{ fontSize: 20 }} />
              </div>

              {isOpen && (
                <span className="whitespace-nowrap text-sm">
                  {t(`labels.menu.${item.key}`)}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function AppMenu() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const clearToken = useTokenStore((s) => s.clearToken);
  const { isOpen: isMobileOpen, closeMobileMenu } = useMobileMenuStore();

  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isMobileOpen) {
        closeMobileMenu();
      }
    }

    const mediaQuery =
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(min-width: 1250px)")
        : null;

    function handleMediaChange(e: MediaQueryListEvent | MediaQueryList) {
      if (e.matches) {
        closeMobileMenu();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    mediaQuery?.addEventListener("change", handleMediaChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      mediaQuery?.removeEventListener("change", handleMediaChange);
    };
  }, [isMobileOpen, closeMobileMenu]);

  async function handleLogout() {
    try {
      await usersService.logout();
    } finally {
      useUserStore.getState().clearUserData();
      clearToken();
      router.push("/login");
    }
  }

  return (
    <>
      <aside
        aria-label="Desktop Menu"
        className={`hidden min-[1250px]:flex bg-zinc-900 dark:bg-background-3 border-r border-r-border py-4 text-white transition-all duration-300 flex-col ${
          isOpen ? "w-64" : "w-18"
        } h-screen sticky top-0 shrink-0 select-none z-40`}
      >
        <div
          className={`flex items-center ${
            isOpen ? "justify-between" : "justify-center"
          } px-3 mb-2`}
        >
          {isOpen && <KivoLogo textColor="text-white" iconColor="text-white" />}
          <AppButton
            rounded
            flat
            color="white"
            onClick={() => setIsOpen(!isOpen)}
            className="min-w-10 w-10 h-10"
            title={t("labels.menu.open_menu") || "Alternar menu"}
            aria-label={t("labels.menu.open_menu") || "Alternar menu"}
          >
            <MenuIcon fontSize="small" />
          </AppButton>
        </div>

        <nav className="mt-2 flex-1 flex flex-col justify-center px-3">
          <MenuList
            items={menuItems}
            pathname={pathname}
            isOpen={isOpen}
            variant="desktop"
          />
        </nav>

        <div className="px-3 flex flex-col gap-2">
          <div className="border-t border-white/10" />

          <AppButton
            color="white"
            flat
            onClick={handleLogout}
            className={`h-12 text-start! justify-start ${
              isOpen ? "px-3 w-full" : "justify-center"
            }`}
          >
            <div className="w-5 min-w-5 flex items-center justify-center">
              <ExitToAppOutlined style={{ fontSize: 20 }} />
            </div>

            {isOpen && (
              <span className="whitespace-nowrap text-sm mt-0.5 ml-1">
                {t("labels.menu.logout")}
              </span>
            )}
          </AppButton>
        </div>
      </aside>

      <div className="min-[1250px]:hidden">
        <div
          className={`fixed inset-0 bg-black/50 z-60 transition-opacity duration-300 ease-out ${
            isMobileOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={closeMobileMenu}
          aria-hidden="true"
        />

        <div
          aria-label="Mobile Menu"
          aria-hidden={!isMobileOpen}
          className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-background border-r border-border py-4 text-foreground z-70 shadow-2xl flex flex-col transition-transform duration-300 ease-out will-change-transform ${
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-3 mb-2">
            <KivoLogo textColor="text-foreground" iconColor="text-black" />

            <AppButton
              rounded
              flat
              color="transparent"
              onClick={closeMobileMenu}
              className="min-w-10 w-10 h-10 text-foreground hover:text-foreground"
              title={t("labels.menu.close_menu") || "Fechar menu"}
              aria-label={t("labels.menu.close_menu") || "Fechar menu"}
            >
              <CloseIcon fontSize="small" />
            </AppButton>
          </div>

          <nav className="mt-2 flex-1 overflow-y-auto flex flex-col justify-center px-3">
            <MenuList
              items={menuItems}
              pathname={pathname}
              isOpen={true}
              variant="mobile"
              onItemClick={closeMobileMenu}
            />
          </nav>

          <div className="px-3 flex flex-col gap-2.5">
            <div className="border-t border-border" />

            <div className="flex items-center justify-between px-1">
              <AppDarkModeToggle />
              <AppLanguageSelect />
            </div>

            <div className="border-t border-border" />

            <AppButton
              color="transparent"
              flat
              onClick={() => {
                closeMobileMenu();
                handleLogout();
              }}
              className="h-12 w-full text-start! justify-start px-3 text-foreground hover:text-foreground"
            >
              <div className="w-5 min-w-5 flex items-center justify-center">
                <ExitToAppOutlined style={{ fontSize: 20 }} />
              </div>
              <span className="whitespace-nowrap text-sm mt-0.5 ml-1">
                {t("labels.menu.logout")}
              </span>
            </AppButton>
          </div>
        </div>
      </div>
    </>
  );
}
