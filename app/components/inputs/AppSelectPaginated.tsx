"use client";

import { useState, useRef, useEffect, forwardRef, useImperativeHandle, ReactElement } from "react";
import AppLabel from "../AppLabel";
import { useClickOutside } from "../../utils/useClickOutside";
import { PaginationResult } from "@/app/utils/usePagination";
import AppSelectTrigger from "./select/AppSelectTrigger";
import AppSelectDropdown from "./select/AppSelectDropdown";
import { AppSelectProvider, SelectOption } from "./select/AppSelectContext";

export interface AppSelectPaginatedProps<T extends SelectOption> {
    label?: string;
    pagination: PaginationResult<T>;
    error?: string;
    search?: boolean;
    multiple?: boolean;
    placeholder?: string;
    disabled?: boolean;
    value?: T["id"] | T["id"][];
    onChange?: (value: T["id"] | T["id"][]) => void;
    className?: string;
}

function AppSelectPaginatedInner<T extends SelectOption>(
    {
        label,
        pagination,
        error,
        search = false,
        multiple = false,
        placeholder = "Selecione...",
        disabled = false,
        value,
        onChange,
        className = "",
    }: AppSelectPaginatedProps<T>,
    ref: React.Ref<HTMLDivElement>
) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const { items, loading, pageData, load } = pagination;

    useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    const toggleDropdown = () => {
        if (!disabled) {
            setIsOpen((prev) => !prev);
        }
    };

    useEffect(() => {
        if (!isOpen) return;

        const listener = (event: MouseEvent | TouchEvent) => {
            const target = event.target as HTMLElement;
            if (
                containerRef.current?.contains(target) ||
                target.closest?.("[data-portal]")
            ) {
                return;
            }
            setIsOpen(false);
        };

        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);

        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && search && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen, search]);

    useEffect(() => {
        if (!isOpen) return;
        const timer = setTimeout(() => {
            load({ params: { search: searchTerm, page: 1 } });
        }, 300);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    const getCurrentValuesArray = (): T["id"][] => {
        if (value === undefined || value === null) return [];
        return Array.isArray(value) ? value : [value];
    };

    const getSelectedNames = () => {
        if (multiple) {
            const currentValues = getCurrentValuesArray();
            if (currentValues.length === 0) return placeholder;

            const selectedItems = items.filter(opt => currentValues.includes(opt.id));
            if (selectedItems.length === currentValues.length) {
                return selectedItems.map(opt => opt.name).join(", ");
            }
            return `${currentValues.length} selecionados`;
        } else {
            const selected = items.find(opt => opt.id === value);
            return selected ? selected.name : (value ? "Item selecionado" : placeholder);
        }
    };

    const removeValue = (e: React.MouseEvent, idToRemove: T["id"]) => {
        e.stopPropagation();
        if (multiple && onChange) {
            const currentValues = getCurrentValuesArray();
            onChange(currentValues.filter(v => v !== idToRemove));
        }
    };

    const contextValue = {
        isOpen,
        setIsOpen,
        toggleDropdown,
        multiple,
        value,
        onChange,
        items,
        loading,
        pageData,
        load,
        search,
        searchTerm,
        setSearchTerm,
        searchInputRef,
        listRef,
        containerRef,
        disabled,
        error,
        removeValue,
        getSelectedNames,
    };

    return (
        <AppSelectProvider value={contextValue}>
            <div className={`flex flex-col gap-1 w-full ${className}`} ref={containerRef}>
                {label && <AppLabel htmlFor={label}>{label}</AppLabel>}
                <div className="relative">
                    <AppSelectTrigger />
                    {isOpen && <AppSelectDropdown />}
                </div>
                {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
            </div>
        </AppSelectProvider>
    );
}

const AppSelectPaginated = forwardRef(AppSelectPaginatedInner) as (<T extends SelectOption>(
    props: AppSelectPaginatedProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => ReactElement) & { displayName?: string };

AppSelectPaginated.displayName = "AppSelectPaginated";

export default AppSelectPaginated;
