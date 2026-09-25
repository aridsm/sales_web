import React from "react";

export interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?:
    | "primary"
    | "primary-3"
    | "background"
    | "red"
    | "transparent"
    | "foreground"
    | "white";
  flat?: boolean;
  rounded?: boolean;
  size?: "small" | "default" | "large";
}

export default function AppButton({
  color = "primary",
  className = "",
  flat = false,
  rounded = false,
  size = "default",
  children,
  ...props
}: AppButtonProps) {
  const hasExplicitHeight = /(?:^|\s)(?:h-|min-h-)\S+/.test(className);
  const hasExplicitPadding = /(?:^|\s)p[xy]?-\S+/.test(className);
  const hasExplicitTextSize = /(?:^|\s)text-(?:xs|sm|base|lg|xl)\b/.test(
    className,
  );
  const isSquare =
    /(?:^|\s)w-\S+/.test(className) && /(?:^|\s)h-\S+/.test(className);

  const sizeClasses = {
    small: `${hasExplicitHeight ? "" : "h-8"} ${hasExplicitPadding || isSquare ? "" : "px-2.5"} ${hasExplicitTextSize ? "" : "text-[11px] md:text-xs"}`,
    default: `${hasExplicitHeight ? "" : "h-8 md:h-10"} ${hasExplicitPadding || isSquare ? "" : "px-3.5"} ${hasExplicitTextSize ? "" : "text-sm"}`,
    large: `${hasExplicitHeight ? "" : "h-10 md:h-12"} ${hasExplicitPadding || isSquare ? "" : "px-5"} ${hasExplicitTextSize ? "" : "text-sm md:text-base"}`,
  }[size];

  const baseClasses = `inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-200 select-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] ${
    rounded ? "rounded-full" : "rounded-xs"
  } ${sizeClasses}`;

  let colorClasses = "";
  if (color === "primary") {
    colorClasses = flat
      ? "bg-transparent text-primary hover:bg-primary-light active:bg-primary-light/80 border border-transparent"
      : "bg-primary text-white active:bg-primary-2/90 shadow-xs hover:bg-primary-hover";
  } else if (color === "primary-3") {
    colorClasses = flat
      ? "bg-transparent text-primary-3 hover:bg-primary-3/10 active:bg-primary-3/20 border border-transparent"
      : "bg-primary-3 text-white active:bg-primary-3/90 shadow-xs border border-primary-3 hover:brightness-110";
  } else if (color === "background") {
    colorClasses = flat
      ? "bg-transparent text-foreground bg-background-3/50 border border-transparent"
      : "text-foreground border border-border hover:border-border-2 bg-background-2 dark:bg-background-3 dark:hover:bg-background-2";
  } else if (color === "red") {
    colorClasses = flat
      ? "bg-transparent text-red-500 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/5 active:bg-red-500/20 border border-red-300 dark:border-red-700"
      : "bg-red-600/80 hover:bg-red-600/90 dark:bg-red-700 dark:hover:bg-red-500/90 text-white active:bg-red-500/10";
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
