"use client";

import { useState } from "react";
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

  async function handleLogout() {
    try {
      await usersService.logout();
    } finally {
      clearToken();
      router.push("/login");
    }
  }

  return (
    <div
      className={`bg-foreground dark:bg-background-3 border-r border-r-border py-4 text-white transition-all duration-300 flex flex-col ${isOpen ? "w-64" : "w-18"} min-h-screen`}
    >
      <div
        className={`flex items-center ${isOpen ? "justify-between" : "justify-center"} px-3 mb-2`}
      >
        {isOpen && (
          <div className="flex items-center gap-2.5 pl-1">
            <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-primary to-primary-2 flex items-center justify-center shrink-0">
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
        <ul className="flex flex-col gap-2">
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
                  className={`flex items-center gap-3 h-12 rounded-md transition-all duration-200 ${
                    isOpen ? "px-3" : "justify-center"
                  } ${
                    isActive
                      ? "bg-primary text-white shadow-sm shadow-primary/20"
                      : "text-white/70 hover:bg-slate-500/15 dark:hover:bg-background-2 hover:text-white"
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
