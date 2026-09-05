"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTokenStore } from "@/stores/tokenStore";
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
} from "@mui/icons-material";
import { Menu as MenuIcon, ExitToAppOutlined } from "@mui/icons-material";
import AppButton from "./AppButton";
import { useTranslation } from "@/app/utils/i18n";

import { useUserStore } from "@/stores/userStore";

const menuItems = [
  { key: "dashboard", href: "/", icon: DashboardOutlined },
  { key: "categories", href: "/categories", icon: CategoryOutlined },
  { key: "products", href: "/products", icon: Inventory2Outlined },
  { key: "sales", href: "/sales", icon: ShoppingCartOutlined },
  { key: "stock_entries", href: "/stock-entries", icon: LocalShippingOutlined },
  { key: "history", href: "/history", icon: History },
  { key: "other_expenses", href: "/other_expenses", icon: ReceiptOutlined },
  { key: "account", href: "/account", icon: AccountCircleOutlined },
];

export default function AppMenu() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const clearToken = useTokenStore((s) => s.clearToken);

  const navRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [pillStyle, setPillStyle] = useState<React.CSSProperties>({
    opacity: 0,
  });

  const getActiveKey = useCallback(() => {
    for (const item of menuItems) {
      const isActive =
        item.href === "/"
          ? pathname === "/"
          : pathname === item.href || pathname.startsWith(item.href + "/");
      if (isActive) return item.key;
    }
    return null;
  }, [pathname]);

  useEffect(() => {
    const activeKey = getActiveKey();
    if (!activeKey) {
      setPillStyle((prev) => ({ ...prev, opacity: 0 }));
      return;
    }

    const el = itemRefs.current.get(activeKey);
    const nav = navRef.current;
    if (el && nav) {
      const navRect = nav.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setPillStyle({
        top: elRect.top - navRect.top,
        left: 0,
        width: elRect.width,
        height: elRect.height,
        opacity: 1,
      });
    }
  }, [pathname, isOpen, getActiveKey]);

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
    <div
      className={`bg-zinc-900 dark:bg-background-3 border-r border-r-border py-4 text-white transition-all duration-300 flex flex-col ${isOpen ? "w-64" : "w-18"} min-h-screen`}
    >
      <div
        className={`flex items-center ${isOpen ? "justify-between" : "justify-center"} px-3 mb-2`}
      >
        {isOpen && (
          <div className="flex items-center gap-2.5 pl-1">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
              <svg
                className="w-3.5 h-3.5 text-white"
                viewBox="0 0 200 200"
                fill="currentColor"
              >
                <rect x="25" y="51" width="150" height="34" rx="8" />
                <rect x="25" y="115" width="150" height="34" rx="8" />
              </svg>
            </div>
            <span className="text-base font-bold tracking-wide text-white">
              Kivo
            </span>
          </div>
        )}
        <AppButton
          rounded
          flat
          color="white"
          onClick={() => setIsOpen(!isOpen)}
          className="min-w-10 w-10 h-10"
        >
          <MenuIcon fontSize="small" />
        </AppButton>
      </div>

      <nav className="mt-2 flex-1 flex flex-col justify-center px-3">
        <ul ref={navRef} className="relative flex flex-col gap-2">
          <div
            className="absolute rounded-md bg-primary transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none"
            style={pillStyle}
          />

          {menuItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href ||
                  pathname.startsWith(item.href + "/");
            return (
              <li key={item.key} className="w-full">
                <Link
                  href={item.href}
                  ref={(el) => {
                    if (el) itemRefs.current.set(item.key, el);
                  }}
                  className={`relative z-[1] flex items-center gap-3 h-12 rounded-md transition-colors duration-200 ${
                    isOpen ? "px-3" : "justify-center"
                  } ${
                    isActive
                      ? "text-black "
                      : "text-white/70 hover:bg-zinc-500/15 dark:hover:bg-background-2 hover:text-white"
                  }`}
                >
                  <div className="w-5 min-w-5 flex items-center justify-center">
                    <item.icon style={{ fontSize: 20 }} />
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
      </nav>

      <div className="px-3 flex flex-col gap-2">
        <div className="border-t border-white/10"></div>

        <AppButton
          color="white"
          flat
          onClick={handleLogout}
          className={`h-12 text-start! justify-start  ${isOpen ? "px-3 w-full" : "justify-center"}`}
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
    </div>
  );
}
