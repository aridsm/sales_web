import React from "react";

export interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: "primary" | "background";
}

export default function AppButton({
  color = "primary",
  className = "",
  children,
  ...props
}: AppButtonProps) {
  const baseClasses =
    "py-2 flex justify-center items-center gap-1.5 cursor-pointer rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  let colorClasses = "";
  if (color === "primary") {
    colorClasses = "bg-primary text-white hover:bg-primary/90 font-medium";
  } else if (color === "background") {
    colorClasses =
      "border border-slate-200 text-foreground hover:bg-slate-100/70 disabled:hover:bg-background bg-background";
  }

  const finalClass = `${baseClasses} ${colorClasses} ${className}`.trim();

  return (
    <button className={finalClass} {...props}>
      {children}
    </button>
  );
}
