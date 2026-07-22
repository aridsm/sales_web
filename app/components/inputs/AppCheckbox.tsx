import React from "react";

export type AppCheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function AppCheckbox({
  className = "",
  ...props
}: AppCheckboxProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <input
        type="checkbox"
        className="peer appearance-none w-4.5 h-4.5 border rounded-sm border-border hover:border-border-2! bg-background dark:bg-transparent checked:bg-primary-3! checked:border-primary-3! hover:checked:bg-primary-3! hover:checked:border-primary-3! dark:checked:bg-primary! dark:checked:border-primary! dark:hover:checked:bg-primary! dark:hover:checked:border-primary! focus:outline-transparent! transition-colors cursor-pointer m-0 px-0! py-0!"
        {...props}
      />
      <svg
        className="absolute w-3 h-3 text-white dark:text-black pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
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
