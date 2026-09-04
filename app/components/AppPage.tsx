"use client";

import AppHeader from "./AppHeader";

interface AppPageProps {
  title: string;
  children: React.ReactNode;
}

export default function AppPage({ title, children }: AppPageProps) {
  return (
    <div className="flex flex-col min-h-0 flex-1">
      <AppHeader title={title} />
      <div className="px-3 sm:px-6 py-4 sm:py-5 max-w-400 w-full mx-auto min-h-0 flex flex-col flex-1">
        {children}
      </div>
    </div>
  );
}
