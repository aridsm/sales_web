"use client";

import { useState, useEffect } from "react";
import {
  LightModeOutlined,
  DarkModeOutlined,
} from "@mui/icons-material";
import AppSwitch from "./inputs/AppSwitch";
import { useColorModeStore } from "../../stores/colorModeStore";

interface AppDarkModeToggleProps {
  className?: string;
  variant?: "default" | "compact" | "responsive";
}

export default function AppDarkModeToggle({
  className = "",
  variant = "default",
}: AppDarkModeToggleProps) {
  const { mode, setMode } = useColorModeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMode = () => {
    setMode(mode === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    if (variant === "compact") {
      return <div className={`w-8 h-8 ${className}`} />;
    }
    if (variant === "responsive") {
      return (
        <div className={`flex items-center ${className}`}>
          <div className="w-8 h-8 sm:hidden" />
          <div className="hidden sm:block w-[92px] h-6" />
        </div>
      );
    }
    return <div className={`w-[92px] h-6 ${className}`} />;
  }

  const compactButton = (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={mode === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
      title={mode === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
      className="w-8 h-8 rounded-full flex items-center justify-center border border-border hover:border-border-2 bg-background-3/50 hover:bg-background-3 dark:bg-background-2/50 dark:hover:bg-background-2 text-foreground-2 hover:text-foreground active:scale-95 transition-all cursor-pointer shrink-0"
    >
      {mode === "dark" ? (
        <LightModeOutlined sx={{ fontSize: 18 }} />
      ) : (
        <DarkModeOutlined sx={{ fontSize: 18 }} />
      )}
    </button>
  );

  const fullSwitch = (
    <div className="flex items-center gap-2 text-foreground">
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

  if (variant === "compact") {
    return <div className={`flex items-center ${className}`}>{compactButton}</div>;
  }

  if (variant === "responsive") {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="sm:hidden flex items-center">{compactButton}</div>
        <div className="hidden sm:flex items-center">{fullSwitch}</div>
      </div>
    );
  }

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
