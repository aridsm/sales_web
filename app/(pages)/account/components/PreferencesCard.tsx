import AppCard from "../../../components/AppCard";
import { LightModeOutlined, DarkModeOutlined } from "@mui/icons-material";
import { useTranslation, setLocale } from "@/app/utils/i18n";
import { useColorModeStore } from "@/stores/colorModeStore";

export default function PreferencesCard() {
  const { t, locale } = useTranslation();
  const { mode, setMode } = useColorModeStore();

  return (
    <AppCard className="p-5 flex flex-col">
      <h3 className="font-semibold text-sm text-foreground">
        {t("labels.account.preferences")}
      </h3>

      <div className="flex flex-col divide-y divide-border text-sm">
        <div className="flex items-center justify-between py-3">
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-foreground">
              {t("labels.account.theme")}
            </span>
          </div>

          <div className="inline-flex p-1 rounded-md bg-background dark:bg-background border border-border gap-1">
            <button
              type="button"
              onClick={() => setMode("light")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                mode === "light"
                  ? "bg-background-2 dark:bg-background-3 shadow-xs text-foreground font-semibold"
                  : "text-label hover:text-foreground"
              }`}
            >
              <LightModeOutlined style={{ fontSize: 14 }} />
              {t("labels.account.theme_light")}
            </button>
            <button
              type="button"
              onClick={() => setMode("dark")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                mode === "dark"
                  ? "bg-background-2 dark:bg-background-3 shadow-xs text-foreground font-semibold"
                  : "text-label hover:text-foreground"
              }`}
            >
              <DarkModeOutlined style={{ fontSize: 14 }} />
              {t("labels.account.theme_dark")}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3">
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-foreground">
              {t("labels.account.language")}
            </span>
          </div>

          <div className="inline-flex p-1 rounded-md bg-background dark:bg-background border border-border gap-1">
            <button
              type="button"
              onClick={() => setLocale("pt-BR")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                locale === "pt-BR"
                  ? "bg-background-2 dark:bg-background-3 shadow-xs text-foreground font-semibold"
                  : "text-label hover:text-foreground"
              }`}
            >
              <span className="sm:hidden">pt-BR</span>
              <span className="hidden sm:inline">
                {t("labels.account.language_pt")}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setLocale("en-US")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                locale === "en-US"
                  ? "bg-background-2 dark:bg-background-3 shadow-xs text-foreground font-semibold"
                  : "text-label hover:text-foreground"
              }`}
            >
              <span className="sm:hidden">en-US</span>
              <span className="hidden sm:inline">
                {t("labels.account.language_en")}
              </span>
            </button>
          </div>
        </div>
      </div>
    </AppCard>
  );
}
