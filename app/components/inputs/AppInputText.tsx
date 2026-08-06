"use client";

import {
  forwardRef,
  InputHTMLAttributes,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";
import AppLabel from "../AppLabel";
import CloseIcon from "@mui/icons-material/Close";

export interface Formatter {
  mask: (value: string | number | undefined) => string;
  unmask: (value: string) => string | number | undefined;
  prefixLength?: number;
}

export interface AppInputTextProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  error?: string;
  type?: "text" | "number" | "email" | "password";
  label?: string;
  mask?: Formatter;
  clearable?: boolean;
  onChange?: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | { target: { name?: string; value: string | number | undefined } },
  ) => void;
}

const AppInputText = forwardRef<HTMLInputElement, AppInputTextProps>(
  (
    {
      type = "text",
      error,
      label,
      mask,
      clearable = false,
      className = "",
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [localValue, setLocalValue] = useState("");

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    useEffect(() => {
      if (isFocused && mask) {
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
            value: unmasked,
          },
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

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setLocalValue("");
      if (props.onChange) {
        props.onChange({
          target: { name: props.name, value: mask ? undefined : "" },
        } as any);
      }
    };

    const displayValue =
      mask && !isFocused
        ? mask.mask(props.value as string | number | undefined)
        : mask
          ? localValue
          : props.value;

    return (
      <div className="flex flex-col gap-1 w-full">
        {label && <AppLabel htmlFor={label}>{label}</AppLabel>}
        <div className="relative flex items-center w-full">
          <input
            ref={inputRef}
            id={label}
            type={type}
            className={`input-field pr-9 w-full ${error ? "border-red-500!" : ""} ${className}`}
            {...props}
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          {clearable && displayValue !== "" && displayValue !== undefined && displayValue !== null && !props.disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center justify-center p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              tabIndex={-1}
            >
              <CloseIcon style={{ fontSize: 16 }} />
            </button>
          )}
        </div>
        {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
      </div>
    );
  },
);

AppInputText.displayName = "AppInputText";

export default AppInputText;
