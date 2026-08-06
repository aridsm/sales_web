"use client";

import React, { createContext, useContext } from 'react';

export interface SelectOption {
    id: string | number;
    name: string;
}

export interface AppSelectContextValue<T extends SelectOption> {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    toggleDropdown: () => void;
    multiple: boolean;
    value?: T["id"] | T["id"][];
    onChange?: (value: T["id"] | T["id"][]) => void;
    items: T[];
    loading: boolean;
    pageData: { page: number; total_pages: number };
    load: (options: { params?: Record<string, unknown> | { [key: string]: string | number | boolean }, append?: boolean }) => void;
    search: boolean;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    searchInputRef: React.RefObject<HTMLInputElement | null>;
    listRef: React.RefObject<HTMLDivElement | null>;
    containerRef?: React.RefObject<HTMLDivElement | null>;
    disabled?: boolean;
    error?: string;
    clearable?: boolean;
    removeValue: (e: React.MouseEvent, idToRemove: T["id"]) => void;
    getSelectedNames: () => string;
}

const AppSelectContext = createContext<AppSelectContextValue<SelectOption> | undefined>(undefined);

export function AppSelectProvider<T extends SelectOption>({ 
    value, 
    children 
}: { 
    value: AppSelectContextValue<T>; 
    children: React.ReactNode 
}) {
    return (
        <AppSelectContext.Provider value={value as any}>
            {children}
        </AppSelectContext.Provider>
    );
}

export function useAppSelect<T extends SelectOption>() {
    const context = useContext(AppSelectContext);
    if (!context) {
        throw new Error("useAppSelect must be used within an AppSelectProvider");
    }
    return context as unknown as AppSelectContextValue<T>;
}
