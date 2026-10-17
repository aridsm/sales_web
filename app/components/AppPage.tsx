"use client";

import AppHeader from "./AppHeader";

interface AppPageProps {
  title: string;
  children: React.ReactNode;
  scrollable?: boolean;
  className?: string;
  contentClassName?: string;
}

export default function AppPage({
  title,
  children,
  scrollable = false,
  className = "",
  contentClassName = "",
}: AppPageProps) {
  const minHeightClass = scrollable ? "min-h-fit" : "min-h-0";

  return (
    <div className={`flex flex-col ${minHeightClass} flex-1 ${className}`}>
      <AppHeader title={title} />
      <div
        className={`px-3 sm:px-6 py-4 sm:py-5 max-w-400 w-full mx-auto ${minHeightClass} flex flex-col flex-1 ${contentClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
