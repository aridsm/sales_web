import React from "react";

export interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?:
    | "primary"
    | "background"
    | "red"
    | "transparent"
    | "foreground"
    | "white";
  flat?: boolean;
  rounded?: boolean;
}

export default function AppButton({
  color = "primary",
  className = "",
  flat = false,
  rounded = false,
  children,
  ...props
}: AppButtonProps) {
  const baseClasses = `py-2 px-4 text-sm flex justify-center items-center gap-1.5 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
    rounded ? "rounded-full" : "rounded-md"
  }`;

  let colorClasses = "";
  if (color === "primary") {
    colorClasses = flat
      ? "bg-transparent text-primary hover:bg-primary-light active:bg-primary-light/80 border border-transparent"
      : "bg-primary text-white hover:bg-primary-3 active:bg-primary-3/90 shadow-xs border border-transparent";
  } else if (color === "background") {
    colorClasses = flat
      ? "bg-transparent text-foreground bg-background-3/50 border border-transparent"
      : "text-foreground border border-border hover:border-border-2 bg-background-2 dark:bg-background-3 dark:hover:bg-background-2";
  } else if (color === "red") {
    colorClasses = flat
      ? "bg-transparent text-red-500 hover:bg-red-500/10 active:bg-red-500/20 border border-transparent"
      : "bg-red-600/80 hover:bg-red-600/90 dark:bg-red-500/80 dark:hover:bg-red-500/90 text-white active:bg-red-500/10";
  } else if (color === "transparent") {
    colorClasses = flat
      ? "bg-transparent text-foreground-2 hover:bg-background-3 hover:text-foreground border border-transparent"
      : "bg-transparent text-foreground-2 border border-border hover:border-border-2 hover:bg-background-3 hover:text-foreground";
  } else if (color === "foreground") {
    colorClasses = flat
      ? "bg-transparent text-foreground hover:bg-background dark:hover:bg-background-2 active:opacity-60 border border-transparent"
      : "bg-foreground text-background hover:opacity-90 active:opacity-80 shadow-xs border border-transparent";
  } else if (color === "white") {
    colorClasses = flat
      ? "bg-transparent text-white hover:bg-slate-500/15 dark:hover:bg-background-2 hover:text-white border border-transparent"
      : "bg-foreground dark:bg-background-3 text-white border border-transparent hover:bg-slate-800 dark:hover:bg-background-2 hover:text-white";
  }

  const finalClass = `${baseClasses} ${colorClasses} ${className}`.trim();

  return (
    <button className={finalClass} {...props}>
      {children}
    </button>
  );
}
