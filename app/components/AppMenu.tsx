"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  History,
  ShoppingCartOutlined,
  DashboardOutlined,
  Inventory2Outlined,
  ReceiptOutlined,
  AccountCircleOutlined,
  CategoryOutlined,
  Menu,
  ExitToAppOutlined,
} from "@mui/icons-material";
import AppButton from "./AppButton";

const menuItems = [
  { name: "Dashboard", href: "/", icon: DashboardOutlined },
  { name: "Categorias", href: "/categories", icon: CategoryOutlined },
  { name: "Produtos", href: "/products", icon: Inventory2Outlined },
  { name: "Vendas", href: "/sale", icon: ShoppingCartOutlined },
  { name: "Histórico", href: "/history", icon: History },
  { name: "Outras Despesas", href: "/other_expenses", icon: ReceiptOutlined },
  { name: "Sua conta", href: "/account", icon: AccountCircleOutlined },
];

export default function AppMenu() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div
      className={`bg-foreground dark:bg-background-3 py-3 text-white transition-all duration-300 flex flex-col ${isOpen ? "w-64" : "w-18"} min-h-screen`}
    >
      <div className="flex items-center pl-3 gap-3">
        <AppButton
          rounded
          color="transparent"
          onClick={() => setIsOpen(!isOpen)}
          className="min-w-12 h-12 rounded-full text-left hover:bg-foreground-2 flex items-center justify-center cursor-pointer text-white"
        >
          <Menu />
        </AppButton>
      </div>

      <nav className="mt-4 my-auto flex-1 flex flex-col justify-center">
        <ul className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <li key={item.name} className="w-full">
              <Link
                href={item.href}
                className={`flex items-center border-l-4 border-transparent gap-5 h-14 pr-1 hover:bg-foreground-2 dark:hover:bg-background  ${
                  pathname === item.href
                    ? "bg-foreground-2 dark:bg-primary border-primary! dark:hover:bg-primary"
                    : ""
                }`}
              >
                <div className="w-6 min-w-6 max-w-6 flex items-center justify-center ml-5">
                  <item.icon fontSize="small" />
                </div>

                {isOpen && (
                  <span className="whitespace-nowrap text-nowrap">
                    {item.name}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <button
        className={`cursor-pointer flex items-center border-l-4 border-transparent gap-5 h-16 pr-1 hover:bg-foreground-2`}
      >
        <div className="w-6 min-w-6 max-w-6 flex items-center justify-center ml-5">
          <ExitToAppOutlined fontSize="small" />
        </div>

        {isOpen && <span className="whitespace-nowrap text-nowrap">Sair</span>}
      </button>
    </div>
  );
}
