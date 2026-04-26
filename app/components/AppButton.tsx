import React from "react";

export interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: "primary" | "background" | "red" | "transparent";
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
  const baseClasses = `py-2 flex justify-center items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${rounded ? "rounded-full" : "rounded-sm"
    }`;

  let colorClasses = "";
  if (color === "primary") {
    colorClasses = "bg-primary text-white hover:bg-primary/90 border border-primary-3";
  } else if (color === "background") {
    colorClasses = `${!flat ? "border border-slate-200" : ""
      } text-foreground hover:bg-background-3 disabled:hover:bg-background bg-background`;
  } else if (color === "red") {
    colorClasses = `bg-primary-2 text-white ${!flat ? "border border-red-500" : ""
      } hover:bg-red-400`;
  } else if (color === "transparent") {
    colorClasses = `${!flat ? "border border-slate-200" : ""
      } bg-transparent text-foreground hover:bg-slate-50`;
  }

  const finalClass = `${baseClasses} ${colorClasses} ${className}`.trim();

  return (
    <button className={finalClass} {...props}>
      {children}
    </button>
  );
}
