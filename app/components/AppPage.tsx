"use client";

import AppHeader from "./AppHeader";

interface AppPageProps {
  title: string;
  children: React.ReactNode;
}

export default function AppPage({ title, children }: AppPageProps) {
  return (
    <div className="flex flex-col ">
      <AppHeader title={title} />
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}
