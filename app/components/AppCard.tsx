"use client";

export default function AppCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col bg-background-2 dark:bg-background-3 border border-border/70 rounded-md ${className || ""}`}
    >
      {children}
    </div>
  );
}
