"use client";

import {
  NotificationsOutlined,
  AccountCircleOutlined,
  LightModeOutlined,
  DarkModeOutlined,
} from "@mui/icons-material";
import AppLogo from "./AppLogo";
import AppSwitch from "./inputs/AppSwitch";
import { useColorModeStore } from "../../stores/colorModeStore";
import AppButton from "./AppButton";

interface AppHeaderProps {
  title: string;
}

export default function AppHeader({ title }: AppHeaderProps) {
  const { mode, setMode } = useColorModeStore();

  return (
    <div className="flex items-center justify-between border-b border-border py-3 transition-colors">
      <div className="max-w-400 w-full flex items-center justify-between mx-auto px-6">
        <div className="flex items-center gap-3">
          <AppLogo />
          <h1 className="text-2xl font-semibold dark:text-white transition-colors">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-foreground">
            <LightModeOutlined
              fontSize="small"
              titleAccess="Modo claro"
              className={`${mode === "light" ? "opacity-100" : "opacity-40"}`}
            />
            <AppSwitch
              value={mode === "dark"}
              onChange={(isDark) => setMode(isDark ? "dark" : "light")}
            />
            <DarkModeOutlined
              fontSize="small"
              titleAccess="Modo escuro"
              className={`${mode === "dark" ? "opacity-100" : "opacity-30"}`}
            />
          </div>
          <div className="flex items-center gap-4">
            <AppButton rounded color="background" className="p-2">
              <NotificationsOutlined />
            </AppButton>
            <AppButton rounded color="background" className="p-2">
              <AccountCircleOutlined />
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  );
}
