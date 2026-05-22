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
      className={`flex flex-col bg-white rounded-md border-border border p-6 ${className || ""}`}
    >
      {children}
    </div>
  );
}
