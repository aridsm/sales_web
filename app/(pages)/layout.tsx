import AppMenu from "../components/AppMenu";

import { Suspense } from "react";
import AuthGuard from "../components/AuthGuard";
import CompanyGuard from "../components/CompanyGuard";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className={`flex h-screen`}>
        <AppMenu />
        <main className="flex-1 flex flex-col min-w-0 overflow-auto relative ">
          <CompanyGuard>
            <Suspense fallback={null}>{children}</Suspense>
          </CompanyGuard>
        </main>
      </div>
    </AuthGuard>
  );
}
