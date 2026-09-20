"use client";

import { useEffect, useState } from "react";
import { LanguageOutlined } from "@mui/icons-material";
import AppSelect from "./inputs/AppSelect";
import { useTranslation, setLocale } from "@/app/utils/i18n";

export default function AppLanguageSelect({ className = "" }: { className?: string }) {
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
      className={className}
      onChange={(val) => setLocale(val as string)}
      triggerTemplate={(selected: any) => (
        <div className="flex items-center gap-1.5 pr-3 pl-2.5 h-8 bg-foreground-2 hover:opacity-90 text-background dark:bg-primary dark:text-black rounded-full transition-all text-xs font-medium cursor-pointer select-none">
          <LanguageOutlined fontSize="small" />
          <span>{selected?.name}</span>
        </div>
      )}
    />
  );
}
