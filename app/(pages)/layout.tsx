import AppMenu from "../components/AppMenu";
import { Figtree } from "next/font/google";
import { Suspense } from "react";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${figtree.className} flex h-screen`}>
      <AppMenu />
      <main className="flex-1 flex flex-col min-w-0">
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}
