import React from "react";

export interface AppCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function AppCheckbox({
  className = "",
  ...props
}: AppCheckboxProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <input
        type="checkbox"
        className={`peer appearance-none w-4 h-4 border rounded-sm border-border hover:border-slate-300 dark:border-border dark:hover:border-stone-500 bg-background dark:bg-transparent checked:bg-primary! dark:checked:bg-primary! checked:border-primary! dark:checked:border-primary! focus:outline-transparent! transition-colors cursor-pointer m-0 px-0! py-0! ${props.checked ? "hover:border-primary!" : ""}`}
        {...props}
      />
      <svg
        className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  );
}
