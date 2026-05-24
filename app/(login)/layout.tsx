import { Figtree } from "next/font/google";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${figtree.className} min-h-screen flex bg-background transition-colors`}
    >
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full filter blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2 dark:bg-primary/10"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary-2/5 rounded-full filter blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2 dark:bg-primary-2/10"></div>

        <div className="w-full max-w-md relative z-10">{children}</div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative bg-[#222329] overflow-hidden flex-col justify-between p-16 border-l border-border/10">
        <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-primary/20 to-violet-600/5 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-primary-3/15 to-emerald-500/5 blur-[100px] pointer-events-none"></div>

        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        ></div>

        <div className="relative z-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-primary to-primary-2 flex items-center justify-center ">
            <svg
              className="w-4 h-4 text-white font-bold"
              viewBox="0 0 200 200"
              fill="currentColor"
            >
              <rect x="25" y="30" width="150" height="34" rx="8" />
              <rect x="25" y="94" width="150" height="34" rx="8" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-wide">
            Kivo
          </span>
        </div>

        <div className="relative z-10 my-auto max-w-lg mx-auto w-full">
          <div className="space-y-12">
            <div className="space-y-3">
              <span className="px-3 py-1 text-xs font-semibold text-primary-2 bg-primary/10 border border-primary/20 rounded-full inline-block">
                Nova versão 2.0
              </span>
              <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
                Controle suas vendas com{" "}
                <span className="bg-gradient-to-r from-primary-2 to-blue-400 bg-clip-text text-transparent">
                  simplicidade
                </span>
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Acompanhe o faturamento da sua empresa, gerencie o estoque de
                produtos e controle despesas em uma plataforma intuitiva e
                ultrarrápida.
              </p>
            </div>

            <div className="relative h-[320px] w-full flex items-center justify-center perspective-[1200px] select-none">
              <div className="relative w-[340px] h-[220px] transform-gpu style-3d rotate-x-[54deg] rotate-z-[-45deg] transition-all duration-700 hover:rotate-x-[48deg] hover:rotate-z-[-40deg] group">
                {/* 1. Base Layer Shadow Effect */}
                <div className="absolute inset-0 bg-primary/20 rounded-md filter blur-2xl opacity-40 translate-z-[-80px] pointer-events-none transition-all duration-500 group-hover:scale-105"></div>

                {/* 2. Expenses Card (Bottom Layer - Red Accent) */}
                <div className="absolute top-8 -left-8 w-[240px] bg-[#2d2e35]/60 backdrop-blur-md border border-rose-500/20 rounded-md p-4 shadow-lg translate-z-[-40px] transition-all duration-500 group-hover:translate-z-[-50px] group-hover:translate-x-[-4px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-rose-400/80">
                      Despesas Totais
                    </span>
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-white">
                      R$ 8.420
                    </span>
                    <span className="text-[10px] text-gray-500">este mês</span>
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-full mt-3 overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full w-[65%]"></div>
                  </div>
                </div>

                <div className="absolute top-12 left-16 w-[220px] bg-[#2d2e35]/70 backdrop-blur-md border border-emerald-500/20 rounded-md p-4 shadow-xl translate-z-[10px] transition-all duration-500 group-hover:translate-z-[15px] group-hover:translate-x-[4px] group-hover:translate-y-[4px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-400/80">
                      Estoque Geral
                    </span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-md font-medium">
                      92%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-white">142</span>
                    <span className="text-[10px] text-gray-400">
                      itens cadastrados
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-3">
                    {[1, 2, 3, 4, 5].map((dot) => (
                      <div
                        key={dot}
                        className={`h-1.5 flex-1 rounded-full ${dot <= 4 ? "bg-emerald-500" : "bg-white/10"}`}
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="absolute -top-12 left-4 w-[260px] bg-[#2d2e35]/85 backdrop-blur-md border border-primary/30 rounded-md p-5 translate-z-[60px] transition-all duration-500 group-hover:translate-z-[80px] group-hover:translate-y-[-6px]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-primary-2">
                      Faturamento Mensal
                    </span>
                    <span className="text-[10px] bg-primary/20 text-primary-2 px-2 py-0.5 rounded-full font-bold">
                      +18.2%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-white tracking-tight">
                      R$ 48.250
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      ,00
                    </span>
                  </div>

                  <div className="h-8 flex items-end gap-1 mt-4 overflow-hidden">
                    {[35, 45, 30, 50, 45, 60, 55, 75, 70, 90, 85].map(
                      (h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-primary/30 to-primary rounded-t-sm"
                          style={{ height: `${h}%` }}
                        ></div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-gray-500">
          <p>Kivo Enterprise Sales Management</p>
          <div className="flex gap-4">
            <span className="hover:text-gray-400 cursor-pointer">Termos</span>
            <span className="hover:text-gray-400 cursor-pointer">
              Privacidade
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
