"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { STOCK_ENTRY_STATUS_CONFIG } from "@/app/utils/constants";
import { formatCurrency } from "@/app/utils/formatters/currency";
import { formatDateTime } from "@/app/utils/formatters/date";

import AppPage from "../../components/AppPage";
import AppFilter from "../../components/AppFilter";
import AppPagination from "../../components/AppPagination";
import AppButton from "../../components/AppButton";
import AppEmptyState from "../../components/AppEmptyState";

import { Controller, useFormContext } from "react-hook-form";
import AppSelectPaginated from "../../components/inputs/AppSelectPaginated";
import AppSelect from "../../components/inputs/AppSelect";
import AppSearchInput from "../../components/inputs/AppSearchInput";
import AppDateRange from "../../components/inputs/AppDateRange";
import AppAmountRange from "../../components/inputs/AppAmountRange";

import {
  usePagination,
  type PaginationService,
} from "../../utils/usePagination";

import { categoriesService } from "@/api/services/CategoryService";
import { Category } from "@/api/schemas/Category";
import { CategoryType } from "@/enums/CategoryType";
import { StockEntry } from "@/api/schemas/StockEntry";
import { stockEntriesService } from "@/api/services/StockEntryService";
import { Product } from "@/api/schemas/Product";
import { productsService } from "@/api/services/ProductService";
import { StockEntryStatus } from "@/enums/StockEntryStatus";
import { useTranslation } from "@/app/utils/i18n";
import { usePermission } from "@/app/utils/usePermission";

import { Add, InventoryOutlined } from "@mui/icons-material";
import Link from "next/link";

export default function StockEntriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const { canEdit } = usePermission();
  const router = useRouter();
  const pathname = usePathname();

  const isNew = pathname === "/stock-entries/new";

  const [filterParams, setFilterParams] = useState<Record<string, unknown>>({});
  const [searchInput, setSearchInput] = useState("");
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleFilterChange = useCallback(
    (params: Record<string, unknown>) => setFilterParams(params),
    [],
  );

  const stockPagination = usePagination<StockEntry>(stockEntriesService, {
    sort: "-code",
  });

  useEffect(() => {
    stockPagination.load({ replace: true, params: filterParams });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterParams]);

  function handleSearch(value: string) {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    setSearchInput(value);
    searchTimeout.current = setTimeout(() => {
      stockPagination.load({
        replace: true,
        params: { ...filterParams, search: value },
      });
    }, 400);
  }

  if (isNew) {
    return <>{children}</>;
  }

  const isEntrySelected = pathname !== "/stock-entries";

  return (
    <AppPage title={t("labels.stock_entries.title")}>
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 h-full relative">
        <div
          className={`flex-col min-w-0 min-h-0 ${isEntrySelected ? "hidden lg:flex lg:w-96 shrink-0" : "flex flex-1"}`}
        >
          <div
            className={` gap-3 mb-3 ${isEntrySelected ? "" : "flex items-center"}`}
          >
            <div className="flex flex-1 gap-3 items-center">
              <div
                className={`flex items-center gap-2 w-full ${isEntrySelected ? "" : "sm:max-w-md mr-auto"}`}
              >
                <AppSearchInput
                  className="w-full"
                  placeholder={t("labels.grid.search_placeholder")}
                  value={searchInput}
                  onChange={handleSearch}
                />
              </div>

              <AppFilter
                onChange={handleFilterChange}
                validKeys={[
                  "category_id",
                  "status",
                  "product_id",
                  "date",
                  "total",
                ]}
              >
                <StockEntryFilterFields />
              </AppFilter>
            </div>

            {canEdit && (
              <AppButton
                color="primary"
                onClick={() => router.push("/stock-entries/new")}
                className={`shrink-0 ${isEntrySelected ? " w-full mt-3" : ""}`}
              >
                <Add style={{ fontSize: 18 }} />
                {t("labels.grid.add_item")}
              </AppButton>
            )}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            {stockPagination.loading && stockPagination.items.length === 0 ? (
              <div className="flex-1 flex justify-center py-20">
                <div className="text-label text-sm">
                  {t("labels.all.processing")}
                </div>
              </div>
            ) : stockPagination.items.length === 0 ? (
              <AppEmptyState className="py-20" />
            ) : (
              <div
                className={`grid gap-3 ${isEntrySelected ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}
              >
                {stockPagination.items.map((entry) => {
                  const isSelected = pathname === `/stock-entries/${entry.id}`;
                  return (
                    <StockEntryCard
                      key={entry.id}
                      entry={entry}
                      isSelected={isSelected}
                      t={t}
                    />
                  );
                })}
              </div>
            )}
          </div>

          <div className="shrink-0 pt-4 mt-auto">
            <AppPagination pagination={stockPagination} />
          </div>
        </div>

        {isEntrySelected && (
          <div className="w-full lg:flex-1 shrink-0 border-border lg:border-l lg:pl-6 overflow-y-auto flex flex-col min-h-0 bg-background dark:bg-background h-full">
            {children}
          </div>
        )}
      </div>
    </AppPage>
  );
}

function StockEntryCard({
  entry,
  isSelected,
  t,
}: {
  entry: StockEntry;
  isSelected: boolean;
  t: (key: string) => string;
}) {
  const status = STOCK_ENTRY_STATUS_CONFIG[entry.status] || {
    bg: "bg-gray-500/10",
    color: "text-gray-500",
    labelKey: "labels.all.unknown",
  };
  const isCanceled = entry.status === StockEntryStatus.CANCELED;

  return (
    <Link
      href={`/stock-entries/${entry.id}`}
      className={`flex flex-col w-full text-left p-5 rounded-md border group relative overflow-hidden ${
        isSelected
          ? "border-primary-3 bg-primary-4 dark:border-primary-3 dark:bg-primary-4"
          : "border-border bg-background-2 dark:bg-background-3 hover:border-border-2 hover:bg-background-3 dark:hover:bg-background-2"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3 w-full">
        <div className="flex flex-col gap-1.5">
          <span
            className={`text-base font-bold ${isSelected ? "text-primary-3 dark:text-primary" : "text-foreground"}`}
          >
            #{entry.code.toString().padStart(6, "0")}
          </span>
          <span className="text-xs text-label">
            {formatDateTime(entry.date)}
          </span>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${status.bg} ${status.color}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isCanceled ? "bg-red-400" : "bg-emerald-400"
            }`}
          />
          {t(status.labelKey)}
        </span>
      </div>

      <div className="flex items-center justify-between w-full mt-auto pt-4 border-t border-border border-dashed">
        <div className="flex items-center gap-1.5 text-label">
          <InventoryOutlined style={{ fontSize: 16 }} />
          <span className="text-sm">
            {entry.items_count || 0} {t("labels.stock_entries.detail.items")}
          </span>
        </div>
        <span
          className={`text-lg font-bold tabular-nums ${
            isCanceled ? "line-through text-label" : "text-foreground"
          }`}
        >
          {formatCurrency(entry.total)}
        </span>
      </div>
    </Link>
  );
}

function StockEntryFilterFields() {
  const { t } = useTranslation();
  const { control } = useFormContext();

  const categories = usePagination<Category>(
    categoriesService as unknown as PaginationService<Category>,
    { type: CategoryType.PRODUCT, page_size: 20 },
  );

  const products = usePagination<Product>(
    productsService as unknown as PaginationService<Product>,
    { page_size: 20 },
  );

  const statusOptions = [
    { id: StockEntryStatus.OPEN, name: t("labels.stock_entries.status.open") },
    {
      id: StockEntryStatus.CANCELED,
      name: t("labels.stock_entries.status.canceled"),
    },
  ];

  useEffect(() => {
    categories.load({ params: { page: 1 } });
    products.load({ params: { page: 1 } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Controller
        control={control}
        name="category_id"
        render={({ field }) => (
          <AppSelectPaginated
            label={t("labels.stock_entries.category")}
            placeholder={t("labels.stock_entries.filter_category")}
            pagination={categories}
            search
            multiple
            clearable
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="status"
        render={({ field }) => (
          <AppSelect
            label={t("labels.all.status")}
            placeholder={t("labels.stock_entries.list.filter_status")}
            options={statusOptions}
            multiple
            clearable
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="product_id"
        render={({ field }) => (
          <AppSelectPaginated
            label={t("labels.stock_entries.product")}
            placeholder={t("labels.grid.search_placeholder")}
            pagination={products}
            search
            multiple
            clearable
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="date"
        render={({ field }) => (
          <AppDateRange label={t("labels.all.date")} {...field} />
        )}
      />

      <Controller
        control={control}
        name="total"
        render={({ field }) => (
          <AppAmountRange label={t("labels.all.total_value")} {...field} />
        )}
      />
    </>
  );
}
