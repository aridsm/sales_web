import { CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useCallback } from "react";
import { useAppSelect, SelectOption } from "./AppSelectContext";

export default function AppSelectDropdown<T extends SelectOption>() {
    const {
        listRef,
        loading,
        pageData,
        load,
        multiple,
        value,
        onChange,
        setIsOpen,
        search,
        searchInputRef,
        searchTerm,
        setSearchTerm,
        items,
    } = useAppSelect<T>();

    const handleScroll = useCallback(() => {
        if (!listRef.current || loading || pageData.page >= pageData.total_pages) return;

        const { scrollTop, scrollHeight, clientHeight } = listRef.current;
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            load({ params: { page: pageData.page + 1 }, append: true });
        }
    }, [loading, pageData, load, listRef]);

    const handleSelect = (option: T) => {
        if (multiple) {
            const currentValues = Array.isArray(value) ? value : [];
            const isSelected = currentValues.includes(option.id as T["id"]);
            const newValues = isSelected
                ? currentValues.filter((v: any) => v !== option.id)
                : [...currentValues, option.id];
            onChange?.(newValues);
        } else {
            onChange?.(option.id);
            setIsOpen(false);
        }
    };

    return (
        <div className="absolute z-50 w-full mt-1 bg-background-2 border border-slate-200 rounded-sm shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
            {search && (
                <div className="px-3 border-b border-slate-100 flex items-center gap-2 sticky top-0 bg-background-2 z-10">
                    <SearchIcon className="text-gray-400" style={{ fontSize: '20px' }} />
                    <input
                        ref={searchInputRef}
                        type="text"
                        className="w-full outline-none border-none transition-all py-3"
                        placeholder="Pesquisar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
            <div
                ref={listRef}
                onScroll={handleScroll}
                className="max-h-60 overflow-y-auto"
            >
                {items.length > 0 ? (
                    <>
                        {items.map((option) => {
                            const isSelected = multiple
                                ? Array.isArray(value) && value.includes(option.id as T["id"])
                                : value === option.id;

                            return (
                                <div
                                    key={option.id}
                                    onClick={() => handleSelect(option)}
                                    className={`
                                                        px-3 py-3 cursor-pointer flex items-center justify-between transition-colors
                                                        ${isSelected ? "bg-primary/6 text-primary" : "text-slate-700 hover:bg-primary/6"}
                                                    `}
                                >
                                    <span className="truncate">{option.name}</span>
                                </div>
                            );
                        })}
                        {loading && (
                            <div className="p-4 flex justify-center sticky bottom-0 bg-white/80 backdrop-blur-sm">
                                <CircularProgress size={24} />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="px-3 py-10 text-center text-gray-400 text-sm italic flex flex-col items-center gap-2">
                        {loading ? (
                            <CircularProgress size={32} />
                        ) : (
                            "Nenhum resultado encontrado"
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}