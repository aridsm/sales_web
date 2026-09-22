"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { formatCurrency } from "@/app/utils/formatters/currency";
import { useTranslation } from "@/app/utils/i18n";
import type { StockCartItem } from "@/app/utils/stockCart";
import type { Product } from "@/api/schemas/Product";
import {
  WarningAmberRounded,
  TrendingDownRounded,
  TrendingFlatRounded,
  InfoOutlined,
} from "@mui/icons-material";

interface StockPriceComparisonProps {
  item: StockCartItem<Product>;
}

export function StockPriceComparison({ item }: StockPriceComparisonProps) {
  const { t } = useTranslation();
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sellingPrice = item.product.price || 0;
  const purchasePrice = item.unit_price || 0;

  const hasPurchase = purchasePrice > 0;
  const hasSelling = sellingPrice > 0;

  const diff = purchasePrice - sellingPrice;
  const isHigher = purchasePrice > sellingPrice;
  const isLower = purchasePrice < sellingPrice;

  let percent = 0;
  let formattedPercent = "0";
  if (hasSelling && hasPurchase) {
    percent = Math.abs((diff / sellingPrice) * 100);
    formattedPercent =
      percent % 1 === 0 ? percent.toFixed(0) : percent.toFixed(1);
  }

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportWidth =
      typeof window !== "undefined" ? window.innerWidth : 1000;
    const viewportHeight =
      typeof window !== "undefined" ? window.innerHeight : 800;

    const popoverWidth = 260;
    const popoverHeight = 195;

    let left = rect.left + rect.width / 2 - popoverWidth / 2;
    if (left + popoverWidth > viewportWidth - 12) {
      left = viewportWidth - popoverWidth - 12;
    }
    if (left < 12) {
      left = 12;
    }

    let top = rect.bottom + 6;
    if (top + popoverHeight > viewportHeight - 12) {
      top = Math.max(12, rect.top - popoverHeight - 6);
    }

    setCoords({ top, left });
  }, []);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    updatePosition();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleScroll() {
      updatePosition();
    }

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", updatePosition);
    document.addEventListener("pointerdown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [isOpen, updatePosition]);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleToggleClick}
        className="shrink-0 cursor-pointer select-none"
      >
        {!hasPurchase ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-background dark:bg-background-2 text-label hover:text-foreground transition-colors">
            <InfoOutlined style={{ fontSize: 13 }} />
            <span>{formatCurrency(sellingPrice)}</span>
          </span>
        ) : isHigher ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/15 transition-colors">
            <WarningAmberRounded style={{ fontSize: 13 }} />
            <span>+{formattedPercent}%</span>
          </span>
        ) : isLower ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15 transition-colors">
            <TrendingDownRounded style={{ fontSize: 13 }} />
            <span>-{formattedPercent}%</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-background dark:bg-background-2 text-label hover:text-foreground transition-colors">
            <TrendingFlatRounded style={{ fontSize: 13 }} />
            <span>0%</span>
          </span>
        )}
      </div>

      {isOpen &&
        coords &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
            className="fixed z-50 w-64 bg-background-2 dark:bg-background-3 border border-border rounded-xs shadow-dropdown p-3 text-foreground flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="flex items-center justify-between border-b border-border pb-1.5">
              <span className="text-xs font-semibold text-foreground">
                {t("labels.stock_entries.new.comparison_title")}
              </span>
              {hasPurchase && (
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                    isHigher
                      ? "bg-red-500/15 text-red-600 dark:text-red-400"
                      : isLower
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-background-3 text-label"
                  }`}
                >
                  {isHigher
                    ? `+${formattedPercent}%`
                    : isLower
                      ? `-${formattedPercent}%`
                      : "0%"}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between items-center text-label">
                <span>{t("labels.stock_entries.new.selling_price")}</span>
                <span className="font-semibold text-foreground tabular-nums">
                  {formatCurrency(sellingPrice)}
                </span>
              </div>
              <div className="flex justify-between items-center text-label">
                <span>{t("labels.stock_entries.new.purchase_price")}</span>
                <span className="font-semibold text-foreground tabular-nums">
                  {formatCurrency(purchasePrice)}
                </span>
              </div>
              <div className="flex justify-between items-center text-label">
                <span>{t("labels.stock_entries.new.difference")}</span>
                <span
                  className={`font-semibold tabular-nums ${
                    isHigher
                      ? "text-red-500"
                      : isLower
                        ? "text-emerald-500"
                        : "text-foreground"
                  }`}
                >
                  {diff > 0 ? "+" : ""}
                  {formatCurrency(diff)}
                </span>
              </div>
            </div>

            <div
              className={`p-2.5 rounded-xs text-xs leading-snug ${
                !hasPurchase
                  ? "bg-background dark:bg-background-2 text-label"
                  : isHigher
                    ? "bg-red-500/10 text-red-600 dark:text-red-400"
                    : isLower
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "bg-background dark:bg-background-2 text-label"
              }`}
            >
              {!hasPurchase
                ? t("labels.stock_entries.new.comparison_no_purchase")
                : isHigher
                  ? t("labels.stock_entries.new.comparison_warning", {
                      percent: formattedPercent,
                    })
                  : isLower
                    ? t("labels.stock_entries.new.comparison_positive", {
                        percent: formattedPercent,
                      })
                    : t("labels.stock_entries.new.comparison_equal")}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
