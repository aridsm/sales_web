"use client";

import AppCard from "@/app/components/AppCard";
import AppButton from "@/app/components/AppButton";
import {
  LightModeOutlined,
  DarkModeOutlined,
  PaletteOutlined,
  TranslateOutlined,
  ExitToAppOutlined,
} from "@mui/icons-material";
import { useTranslation, setLocale } from "@/app/utils/i18n";
import { useColorModeStore } from "@/stores/colorModeStore";

interface AccountPreferencesTabProps {
  onLogout: () => void;
}

export default function AccountPreferencesTab({
  onLogout,
}: AccountPreferencesTabProps) {
  const { t, locale } = useTranslation();
  const { mode, setMode } = useColorModeStore();

  return (
    <div className="flex flex-col gap-5 w-full">
      <AppCard className="p-4 sm:p-6 flex flex-col gap-2">
        <div>
          <h3 className="font-semibold text-base text-foreground mb-1">
            {t("labels.account.system_preferences")}
          </h3>
          <p className="text-label">
            {t("labels.account.system_preferences_description")}
          </p>
        </div>

        <div className="flex flex-col divide-y divide-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-3">
            <div className="flex items-center gap-2.5">
              <PaletteOutlined
                style={{ fontSize: 18 }}
                className="text-primary-3"
              />
              <div className="flex flex-col">
                <span className="font-medium text-foreground">
                  {t("labels.account.theme")}
                </span>
                <span className=" text-label">
                  {t("labels.account.theme_description")}
                </span>
              </div>
            </div>

            <div className="inline-flex p-1 text-xs max-sm:w-full rounded-xs bg-background dark:bg-background border border-border gap-1 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setMode("light")}
                className={`px-3 py-1.5 max-sm:flex-1 justify-center rounded-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  mode === "light"
                    ? "bg-background-2 dark:bg-background-3 shadow-xs text-foreground font-semibold"
                    : "text-label hover:text-foreground"
                }`}
              >
                <LightModeOutlined style={{ fontSize: 15 }} />
                {t("labels.account.theme_light")}
              </button>
              <button
                type="button"
                onClick={() => setMode("dark")}
                className={`px-3 py-1.5 rounded-xs max-sm:flex-1 justify-center font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  mode === "dark"
                    ? "bg-background-2 dark:bg-background-3 shadow-xs text-foreground font-semibold"
                    : "text-label hover:text-foreground"
                }`}
              >
                <DarkModeOutlined style={{ fontSize: 15 }} />
                {t("labels.account.theme_dark")}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-3">
            <div className="flex items-center gap-2.5">
              <TranslateOutlined
                style={{ fontSize: 18 }}
                className="text-primary-3"
              />
              <div className="flex flex-col">
                <span className="font-medium text-foreground">
                  {t("labels.account.language")}
                </span>
                <span className=" text-label">
                  {t("labels.account.language_description")}
                </span>
              </div>
            </div>

            <div className="inline-flex p-1 text-xs max-sm:w-full rounded-xs bg-background dark:bg-background border border-border gap-1 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setLocale("pt-BR")}
                className={`px-3 py-1.5 rounded-xs max-sm:flex-1 justify-center font-medium transition-all cursor-pointer ${
                  locale === "pt-BR"
                    ? "bg-background-2 dark:bg-background-3 shadow-xs text-foreground font-semibold"
                    : "text-label hover:text-foreground"
                }`}
              >
                {t("labels.account.language_pt")}
              </button>
              <button
                type="button"
                onClick={() => setLocale("en-US")}
                className={`px-3 py-1.5 rounded-xs max-sm:flex-1 justify-center font-medium transition-all cursor-pointer ${
                  locale === "en-US"
                    ? "bg-background-2 dark:bg-background-3 shadow-xs text-foreground font-semibold"
                    : "text-label hover:text-foreground"
                }`}
              >
                {t("labels.account.language_en")}
              </button>
            </div>
          </div>

          <div className="flex flex-row items-center justify-between pt-4 gap-3">
            <div className="flex flex-col">
              <span className="font-semibold text-base text-foreground">
                {t("labels.account.session")}
              </span>
              <span className=" text-label">
                {t("labels.account.session_description")}
              </span>
            </div>

            <AppButton
              onClick={onLogout}
              color="red"
              className="py-1.5 px-3! hover:bg-red-500/10! hover:text-red-500! gap-1.5 self-center sm:self-auto"
            >
              <ExitToAppOutlined style={{ fontSize: 16 }} />
              <span>{t("labels.menu.logout")}</span>
            </AppButton>
          </div>
        </div>
      </AppCard>
    </div>
  );
}
