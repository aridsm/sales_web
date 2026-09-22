import { HTMLAttributes } from "react";

export default function AppCard({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex flex-col bg-background-2 dark:bg-background-3 border border-border rounded-xs ${className || ""}`}
      {...props}
    >
      {children}
    </div>
  );
}
