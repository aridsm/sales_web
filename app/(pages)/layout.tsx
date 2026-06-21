import AppMenu from "../components/AppMenu";

import { Suspense } from "react";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`flex h-screen`}>
      <AppMenu />
      <main className="flex-1 flex flex-col min-w-0 overflow-auto relative ">
        <Suspense fallback={null}>{children}</Suspense>
      </main>
    </div>
  );
}
