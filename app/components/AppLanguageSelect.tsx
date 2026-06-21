"use client";

import { useEffect, useState } from "react";
import { LanguageOutlined } from "@mui/icons-material";
import AppSelect from "./inputs/AppSelect";
import { useTranslation, setLocale } from "@/app/utils/i18n";

export default function AppLanguageSelect() {
  const [mounted, setMounted] = useState(false);
  const { locale: currentLocale } = useTranslation();

  useEffect(() => {
    setMounted(true);
    document.documentElement.lang = currentLocale;
  }, [currentLocale]);

  const languageOptions = [
    { id: "pt-BR", name: "pt-BR" },
    { id: "en-US", name: "en-US" },
  ];

  if (!mounted) return null;

  return (
    <AppSelect
      options={languageOptions}
      value={currentLocale}
      onChange={(val) => setLocale(val as string)}
      triggerTemplate={(selected: any) => (
        <div className="flex items-center gap-1.5 pr-3 pl-2 py-1 bg-foreground-2 hover:bg-foreground/90 text-background dark:bg-yellow-300 dark:hover:bg-yellow-400 dark:text-black rounded-full transition-colors text-sm font-medium">
          <LanguageOutlined fontSize="small" />
          <span>{selected?.name || "Idioma"}</span>
        </div>
      )}
    />
  );
}
