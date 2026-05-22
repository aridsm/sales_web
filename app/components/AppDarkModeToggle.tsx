"use client";

import {
  LightModeOutlined,
  DarkModeOutlined,
} from "@mui/icons-material";
import AppSwitch from "./inputs/AppSwitch";
import { useColorModeStore } from "../../stores/colorModeStore";

interface AppDarkModeToggleProps {
  className?: string;
}

export default function AppDarkModeToggle({ className = "" }: AppDarkModeToggleProps) {
  const { mode, setMode } = useColorModeStore();

  return (
    <div className={`flex items-center gap-2 text-foreground ${className}`}>
      <LightModeOutlined
        fontSize="small"
        titleAccess="Modo claro"
        className={`transition-opacity ${mode === "light" ? "opacity-100" : "opacity-40"}`}
      />
      <AppSwitch
        value={mode === "dark"}
        onChange={(isDark) => setMode(isDark ? "dark" : "light")}
      />
      <DarkModeOutlined
        fontSize="small"
        titleAccess="Modo escuro"
        className={`transition-opacity ${mode === "dark" ? "opacity-100" : "opacity-30"}`}
      />
    </div>
  );
}
