"use client";

import React from "react";
import { PaginationResult } from "../utils/usePagination";
import {
  KeyboardDoubleArrowRight,
  KeyboardDoubleArrowLeft,
  KeyboardArrowRight,
  KeyboardArrowLeft,
} from "@mui/icons-material";
import AppButton from "./AppButton";
import AppInputText from "./inputs/AppInputText";
import { useTranslation } from "@/app/utils/i18n";

interface AppPaginationProps<T> {
  pagination: PaginationResult<T>;
}

export default function AppPagination<T>({
  pagination,
}: AppPaginationProps<T>) {
  const { t } = useTranslation();
  const { pageData, load } = pagination;

  const [pageInput, setPageInput] = React.useState<string>(
    String(pageData.page || 1),
  );

  React.useEffect(() => {
    setPageInput(String(pageData.page || 1));
  }, [pageData.page]);

  const handlePageChange = (p: number) => {
    if (p >= 1 && p <= pageData.total_pages && p !== pageData.page) {
      load({ params: { page: p } });
    }
  };

  const handlePageInputSubmit = () => {
    const p = parseInt(pageInput, 10);
    if (!isNaN(p)) {
      if (p >= 1 && p <= pageData.total_pages) {
        handlePageChange(p);
      } else {
        setPageInput(String(pageData.page));
      }
    } else {
      setPageInput(String(pageData.page));
    }
  };

  const pages = React.useMemo(() => {
    const total = pageData.total_pages || 1;
    const current = pageData.page || 1;
    if (total <= 6) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 3) {
      return [1, 2, 3, 4, "...", total];
    } else if (current >= total - 2) {
      return [1, "...", total - 3, total - 2, total - 1, total];
    } else {
      return [1, "...", current - 1, current, current + 1, "...", total];
    }
  }, [pageData.page, pageData.total_pages]);

  if (pageData.total_pages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col xl:flex-row justify-between items-center py-4 border-t border-border gap-4 text-sm text-foreground">
      <div className="flex flex-wrap items-center justify-center gap-1">
        {pageData.total_pages > 2 && (
          <AppButton
            color="background"
            onClick={() => handlePageChange(1)}
            disabled={pageData.page <= 1}
            className="px-3"
          >
            <KeyboardDoubleArrowLeft
              fontSize="small"
              className="text-label/50"
            />{" "}
            {t("labels.pagination.first_page")}
          </AppButton>
        )}
        <AppButton
          color="background"
          onClick={() => handlePageChange(pageData.page - 1)}
          disabled={pageData.page <= 1}
          className="px-3"
        >
          <KeyboardArrowLeft fontSize="small" className="text-label/50" />{" "}
          {t("labels.pagination.prev")}
        </AppButton>

        <div className="flex gap-1 mx-2">
          {pages.map((p, idx) => {
            const isDots = p === "...";
            return (
              <AppButton
                key={idx}
                color={p === pageData.page ? "primary" : "background"}
                onClick={() => typeof p === "number" && handlePageChange(p)}
                disabled={isDots}
                className={
                  isDots
                    ? "px-3! py-1! border-transparent! bg-transparent! text-slate-400 cursor-default!"
                    : "px-3! py-1!"
                }
              >
                {p}
              </AppButton>
            );
          })}
        </div>

        <AppButton
          color="background"
          onClick={() => handlePageChange(pageData.page + 1)}
          disabled={pageData.page >= pageData.total_pages}
          className="px-3"
        >
          {t("labels.pagination.next")}{" "}
          <KeyboardArrowRight fontSize="small" className="text-label/50" />
        </AppButton>
        {pageData.total_pages > 2 && (
          <AppButton
            color="background"
            onClick={() => handlePageChange(pageData.total_pages)}
            disabled={pageData.page >= pageData.total_pages}
            className="px-3"
          >
            {t("labels.pagination.last_page")}{" "}
            <KeyboardDoubleArrowRight
              fontSize="small"
              className="text-label/50"
            />
          </AppButton>
        )}
      </div>

      <div className="flex items-center gap-2 whitespace-nowrap">
        <span>{t("labels.pagination.page")}</span>
        <div className="w-18">
          <AppInputText
            type="number"
            min={1}
            max={pageData.total_pages}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onBlur={handlePageInputSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handlePageInputSubmit();
            }}
            className="h-8! py-0!"
          />
        </div>
        <span>
          {t("labels.pagination.info", { total_pages: pageData.total_pages, total_items: pageData.total_items })}
        </span>
      </div>
    </div>
  );
}
