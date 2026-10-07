"use client";

import Link from "next/link";
import AppLogo from "@/app/components/AppLogo";
import AppDarkModeToggle from "@/app/components/AppDarkModeToggle";
import AppLanguageSelect from "@/app/components/AppLanguageSelect";
import { useTranslation } from "@/app/utils/i18n";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex bg-background-2 dark:bg-background-3 transition-colors">
      <div className="hidden lg:flex lg:w-1/3 xl:w-[35%] relative bg-[#1e1b4b] overflow-hidden flex-col justify-between p-10 lg:p-12 xl:p-14 select-none">
        <div
          className="absolute inset-0 bg-repeat pointer-events-none select-none"
          style={{
            backgroundImage: "url('/wavey-fingerprint.svg')",
            backgroundRepeat: "repeat",
            backgroundSize: "auto auto",
          }}
        />

        <svg
          viewBox="0 0 480 480"
          className="absolute bottom-2 right-4 w-28 h-24 lg:w-24 lg:h-28 pointer-events-none select-none z-1 text-primary fill-current"
        >
          <path d="M0 0h230c138 0 250 112 250 250v230H250C112 480 0 368 0 230V0Z" />
        </svg>

        <div className="relative z-10 flex items-center gap-2.5">
          <AppLogo className="w-6 h-6 shrink-0" />
          <span className="text-lg font-semibold text-white">SalesApp</span>
        </div>

        <div className="relative z-10 my-auto w-full max-w-lg">
          <svg
            viewBox="0 0 480 480"
            className="absolute left-0 -top-12 w-10 h-10 lg:h-10 pointer-events-none select-none z-1 rotate-90 text-primary fill-current"
          >
            <path d="M0 0h230c138 0 250 112 250 250v230H250C112 480 0 368 0 230V0Z" />
          </svg>
          <h2 className="text-3xl lg:text-3xl xl:text-5xl font-bold text-white tracking-tight leading-[1.15] drop-shadow-sm">
            {t("labels.auth_banner.title")}
          </h2>
          <p className="text-white/90 text-sm sm:text-base xl:text-lg mt-4 font-normal leading-relaxed drop-shadow-xs">
            {t("labels.auth_banner.description")}
          </p>

          <Link
            href="/register"
            className="inline-flex items-center justify-center px-6 py-2.5 border border-white text-white font-medium hover:bg-white/10 active:bg-white/20 transition-all text-sm mt-6 self-start tracking-wide"
          >
            {t("labels.auth_banner.start_now")}
          </Link>
        </div>

        <div className="relative z-10 text-white text-sm tracking-wide">
          salesapp.com
        </div>
      </div>

      <div className="w-full lg:w-2/3 xl:w-[65%] min-h-screen flex flex-col justify-between p-4 sm:p-10 lg:p-14 relative bg-background-2 dark:bg-background-3">
        <header className="w-full flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 lg:hidden group">
            <AppLogo className="w-5 h-5 shrink-0" />
            <span className="text-sm sm:text-lg font-semibold tracking-wide text-foreground group-hover:opacity-80 transition-opacity">
              SalesApp
            </span>
          </Link>

          <div className="flex items-center justify-end lg:justify-between gap-2 sm:gap-6 w-full">
            <AppDarkModeToggle variant="responsive" />
            <AppLanguageSelect />
          </div>
        </header>

        <main className="w-full max-w-md mx-auto sm:my-auto py-8">
          {children}
        </main>

        <footer className="w-full text-center sm:text-sm text-label/70 pt-4">
          © {new Date().getFullYear()} SalesApp. {t("labels.all.all_rights")}.
        </footer>
      </div>
    </div>
  );
}
