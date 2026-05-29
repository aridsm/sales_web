"use client";

import React, { useEffect, useRef } from "react";
import { PaginationResult } from "@/app/utils/usePagination";
import AppLoading from "./AppLoading";
import { SearchOutlined } from "@mui/icons-material";

interface AppInfinityProps<T> {
  pagination: PaginationResult<T>;
  children: React.ReactNode;
  initialLoaded?: boolean;
  className?: string;
  emptyMessage?: string;
}

export default function AppInfinity<T>({
  pagination,
  children,
  initialLoaded = true,
  className = "",
  emptyMessage = "Nenhum resultado encontrado",
}: AppInfinityProps<T>) {
  const { pageData, load, loading, items } = pagination;
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) return;
    if (pageData.page >= pageData.total_pages) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !loading) {
          load({ params: { page: pageData.page + 1 }, append: true });
        }
      },
      {
        root: null,
        rootMargin: "100px", // trigger loading before reaching the end of the scroll
        threshold: 0.1,
      }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [load, loading, pageData.page, pageData.total_pages]);

  // 1. Initial Loading State (First load)
  if (!initialLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-64 w-full text-label gap-3">
        <AppLoading />
        <span className="text-sm font-medium">Carregando itens...</span>
      </div>
    );
  }

  // 2. Empty State (No items found)
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 w-full text-label gap-2">
        <SearchOutlined style={{ fontSize: 40, opacity: 0.3 }} />
        <span className="text-sm">{emptyMessage}</span>
      </div>
    );
  }

  // 3. Main list content + bottom pagination spinner
  return (
    <div className={className}>
      {children}
      {/* Sentinel element to trigger loading next page */}
      <div ref={sentinelRef} className="w-full flex justify-center py-6 min-h-[60px]">
        {loading && (
          <div className="flex flex-col items-center gap-1.5 text-label">
            <AppLoading />
            <span className="text-xs font-medium">Carregando mais...</span>
          </div>
        )}
      </div>
    </div>
  );
}
