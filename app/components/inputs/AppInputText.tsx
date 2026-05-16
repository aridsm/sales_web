import { forwardRef, InputHTMLAttributes, useImperativeHandle, useRef, useState, useEffect } from "react";
import AppLabel from "../AppLabel";

export interface Formatter {
    mask: (value: any) => string;
    unmask: (value: string) => any;
    prefixLength?: number;
}

export interface AppInputTextProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    error?: string;
    type?: "text" | "number" | "email" | "password";
    label?: string;
    mask?: Formatter;
    onChange?: (e: React.ChangeEvent<HTMLInputElement> | { target: { name?: string, value: any } }) => void;
}

const AppInputText = forwardRef<HTMLInputElement, AppInputTextProps>(
    ({ type = "text", error, label, mask, className = "", onFocus, onBlur, ...props }, ref) => {
        const inputRef = useRef<HTMLInputElement>(null);
        const [isFocused, setIsFocused] = useState(false);
        const [localValue, setLocalValue] = useState("");

        useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

        // Sincroniza o valor local se o valor externo mudar (ex: reset do formulário)
        useEffect(() => {
            if (isFocused && mask) {
                // Só atualiza se o valor numérico for realmente diferente para não quebrar a digitação
                const currentUnmasked = mask.unmask(localValue);
                if (currentUnmasked !== props.value) {
                    setLocalValue(props.value?.toString() ?? "");
                }
            }
        }, [props.value, isFocused, mask]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            
            if (mask) {
                setLocalValue(val);
                const unmasked = mask.unmask(val);
                props.onChange?.({
                    target: {
                        name: props.name,
                        value: unmasked
                    }
                });
            } else {
                props.onChange?.(e);
            }
        };

        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(true);
            setLocalValue(props.value?.toString() ?? "");
            onFocus?.(e);
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(false);
            onBlur?.(e);
        };

        const displayValue = (mask && !isFocused) 
            ? mask.mask(props.value) 
            : (mask ? localValue : props.value);

        return (
            <div className="flex flex-col gap-1 w-full">
                {label && <AppLabel htmlFor={label}>{label}</AppLabel>}
                <input
                    ref={inputRef}
                    id={label}
                    type={type}
                    className={`input-field ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                        } ${className}`}
                    {...props}
                    value={displayValue}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
                {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
            </div>
        );
    },
);

AppInputText.displayName = "AppInputText";

export default AppInputText;
