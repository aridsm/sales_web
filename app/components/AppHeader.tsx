"use client";

import { useEffect, useState } from "react";
import {
  NotificationsOutlined,
  AccountCircleOutlined,
  LanguageOutlined,
} from "@mui/icons-material";
import AppButton from "./AppButton";
import AppDarkModeToggle from "./AppDarkModeToggle";
import AppSelect from "./inputs/AppSelect";
import { useTranslation, setLocale } from "@/app/utils/i18n";

interface AppHeaderProps {
  title: string;
}

export default function AppHeader({ title }: AppHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const { locale: currentLocale } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  const languageOptions = [
    { id: "pt-BR", name: "Português" },
    { id: "en-US", name: "Inglês" },
  ];

  return (
    <div className="flex items-center justify-between border-b border-border py-3 transition-colors bg-background-2 dark:bg-background">
      <div className="max-w-400 w-full flex items-center justify-between mx-auto px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-foreground transition-colors">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-5">
          <AppDarkModeToggle />

          <AppButton
            rounded
            flat
            color="transparent"
            className="w-9 h-9 text-foreground hover:text-foreground"
          >
            <NotificationsOutlined fontSize="small" />
          </AppButton>
          <AppButton
            rounded
            flat
            color="transparent"
            className="w-9 h-9 text-foreground hover:text-foreground"
          >
            <AccountCircleOutlined fontSize="small" />
          </AppButton>

          {mounted && (
            <AppSelect
              options={languageOptions}
              value={currentLocale}
              onChange={(val) => setLocale(val)}
              triggerTemplate={(selected: any) => (
                <div className="flex items-center gap-1.5 pr-3 pl-2 py-1 bg-primary/10 hover:bg-primary/15 text-primary dark:text-foreground dark:bg-foreground/10 dark:hover:bg-foreground/15 rounded-full transition-colors text-sm font-medium">
                  <LanguageOutlined fontSize="small" />
                  <span>{selected?.name || "Idioma"}</span>
                </div>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}
