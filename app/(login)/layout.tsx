import Link from "next/link";
import AppLogo from "@/app/components/AppLogo";
import AppDarkModeToggle from "@/app/components/AppDarkModeToggle";
import AppLanguageSelect from "@/app/components/AppLanguageSelect";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-background-2 dark:bg-background-3 transition-colors">
      <div className="hidden lg:flex lg:w-1/3 xl:w-[35%] relative bg-[#6366f1] overflow-hidden flex-col justify-between p-10 lg:p-12 xl:p-14 select-none">
        <img
          src="/sun-tornado.svg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        />

        <img
          src="/shapes/mix-square-circle-quarter-corners.svg"
          alt=""
          className="absolute bottom-2 right-4 w-28 h-24 lg:w-24 lg:h-28 pointer-events-none select-none z-1"
        />

        <div className="relative z-10 flex items-center gap-2.5">
          <AppLogo className="w-6 h-6 shrink-0" />
          <span className="text-lg font-semibold text-white">SalesApp</span>
        </div>

        <div className="relative z-10 my-auto w-full max-w-lg">
          <img
            src="/shapes/mix-square-circle-quarter-corners.svg"
            alt=""
            className="absolute left-0 -top-12 w-10 lg:h-10 pointer-events-none select-none z-1 rotate-90"
          />
          <h2 className="text-3xl lg:text-3xl xl:text-5xl font-bold text-white tracking-tight leading-[1.15] drop-shadow-sm">
            Gerencie suas vendas com inteligência e simplicidade
          </h2>
          <p className="text-white/90 text-sm sm:text-base xl:text-lg mt-4 font-normal leading-relaxed drop-shadow-xs">
            Acompanhe seu faturamento, controle despesas e organize seu estoque
            em tempo real.
          </p>

          <Link
            href="/register"
            className="inline-flex items-center justify-center px-6 py-2.5 border border-white text-white font-medium hover:bg-white/10 active:bg-white/20 transition-all text-sm mt-6 self-start tracking-wide"
          >
            Começar agora
          </Link>
        </div>

        <div className="relative z-10 text-white text-sm tracking-wide">
          salesapp.com
        </div>
      </div>

      <div className="w-full lg:w-2/3 xl:w-[65%] min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative bg-background-2 dark:bg-background-3">
        <header className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 lg:hidden group">
              <AppLogo className="w-7 h-7 shrink-0" />
              <span className="text-lg font-bold tracking-tight text-foreground group-hover:opacity-80 transition-opacity">
                SalesApp
              </span>
            </Link>
            <AppDarkModeToggle />
          </div>

          <div className="flex items-center">
            <AppLanguageSelect />
          </div>
        </header>

        <main className="w-full max-w-md mx-auto my-auto py-8">{children}</main>

        <footer className="w-full text-center text-sm text-label/70 pt-4">
          © {new Date().getFullYear()} SalesApp. Todos os direitos reservados.
        </footer>
      </div>
    </div>
  );
}
