import { forwardRef, InputHTMLAttributes } from "react";
import AppLabel from "../AppLabel";

export interface AppInputTextProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    type?: "text" | "number" | "email" | "password";
    label?: string;
}

const AppInputText = forwardRef<HTMLInputElement, AppInputTextProps>(
    ({ type = "text", error, label, className = "", ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1 w-full">
                {label && <AppLabel htmlFor={label}>{label}</AppLabel>}
                <input
                    ref={ref}
                    id={label}
                    type={type}
                    className={` ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                        } ${className}`}
                    {...props}
                />
                {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
            </div>
        );
    },
);

AppInputText.displayName = "AppInputText";

export default AppInputText;
