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
      className={`flex flex-col bg-white rounded-sm border-gray-300 border p-6 ${className || ""}`}
    >
      {children}
    </div>
  );
}
