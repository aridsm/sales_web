"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { STATUS_CONFIG } from "@/app/utils/constants";
import { formatCurrency } from "@/app/utils/formatters/currency";
import { formatDateTime } from "@/app/utils/formatters/date";
import AppCreatedBy from "@/app/components/AppCreatedBy";

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
import { Sale } from "@/api/schemas/Sale";
import { salesService } from "@/api/services/SaleService";
import { Product } from "@/api/schemas/Product";
import { productsService } from "@/api/services/ProductService";
import { SaleStatus } from "@/enums/SaleStatus";
import { useTranslation } from "@/app/utils/i18n";
import { usePermission } from "@/app/utils/usePermission";

import { SalesContext } from "./SalesContext";
import { Add, InventoryOutlined } from "@mui/icons-material";
import Link from "next/link";

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const { canEdit } = usePermission();
  const router = useRouter();
  const pathname = usePathname();

  const isNew = pathname === "/sales/new";

  const [filterParams, setFilterParams] = useState<Record<string, unknown>>({});
  const [searchInput, setSearchInput] = useState("");
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleFilterChange = useCallback(
    (params: Record<string, unknown>) => setFilterParams(params),
    [],
  );

  const salesPagination = usePagination<Sale>(salesService, { sort: "-code" });

  const updateSale = useCallback(
    (updated: Partial<Sale> & { id: string }) => {
      salesPagination.setItems((prev) =>
        prev.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item,
        ),
      );
    },
    [salesPagination],
  );

  const refreshSales = useCallback(() => {
    salesPagination.load({ replace: true, params: filterParams });
  }, [salesPagination, filterParams]);

  useEffect(() => {
    salesPagination.load({ replace: true, params: filterParams });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterParams]);

  function handleSearch(value: string) {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    setSearchInput(value);
    searchTimeout.current = setTimeout(() => {
      salesPagination.load({
        replace: true,
        params: { ...filterParams, search: value },
      });
    }, 400);
  }

  if (isNew) {
    return <>{children}</>;
  }

  const isSaleSelected = pathname !== "/sales";

  return (
    <SalesContext.Provider value={{ updateSale, refreshSales }}>
      <AppPage title={t("labels.sales.title")}>
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 h-full relative">
          <div
            className={`flex-col min-w-0 min-h-0 ${isSaleSelected ? "hidden lg:flex lg:w-96 shrink-0" : "flex flex-1"}`}
          >
            <div
              className={`gap-2 min-[900px]:gap-3 mb-3 ${isSaleSelected ? "" : "flex items-center"}`}
            >
              <div className="flex flex-1 gap-2 min-[900px]:gap-3 items-center min-w-0">
                <div
                  className={`flex items-center gap-2 w-full min-w-0 ${isSaleSelected ? "" : "sm:max-w-md mr-auto"}`}
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
                  <SaleFilterFields />
                </AppFilter>
              </div>

              {canEdit && (
                <AppButton
                  color="primary"
                  onClick={() => router.push("/sales/new")}
                  className={`shrink-0 w-10 min-w-10 px-0 min-[900px]:w-auto min-[900px]:min-w-0 min-[900px]:px-3.5 ${isSaleSelected ? "w-full mt-3 min-[900px]:w-full" : ""}`}
                  title={t("labels.grid.add_item")}
                  aria-label={t("labels.grid.add_item")}
                >
                  <Add style={{ fontSize: 18 }} />
                  <span className="hidden min-[900px]:inline">
                    {t("labels.grid.add_item")}
                  </span>
                </AppButton>
              )}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
              {salesPagination.loading && salesPagination.items.length === 0 ? (
                <div className="flex-1 flex justify-center py-20">
                  <div className="text-label text-sm">
                    {t("labels.all.processing")}
                  </div>
                </div>
              ) : salesPagination.items.length === 0 ? (
                <AppEmptyState className="py-20" />
              ) : (
                <div
                  className={`grid gap-3 ${isSaleSelected ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"}`}
                >
                  {salesPagination.items.map((sale) => {
                    const isSelected = pathname === `/sales/${sale.id}`;
                    return (
                      <SaleCard
                        key={sale.id}
                        sale={sale}
                        isSelected={isSelected}
                        t={t}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            <div className="shrink-0 pt-4 mt-auto">
              <AppPagination pagination={salesPagination} />
            </div>
          </div>

          {isSaleSelected && (
            <div className="w-full lg:flex-1 shrink-0 border-border lg:border-l lg:pl-6 overflow-y-auto flex flex-col min-h-0 bg-background dark:bg-background h-full">
              {children}
            </div>
          )}
        </div>
      </AppPage>
    </SalesContext.Provider>
  );
}

function SaleCard({
  sale,
  isSelected,
  t,
}: {
  sale: Sale;
  isSelected: boolean;
  t: (key: string) => string;
}) {
  const status = STATUS_CONFIG[sale.status];
  const isCanceled = sale.status === SaleStatus.CANCELED;

  return (
    <Link
      href={`/sales/${sale.id}`}
      className={`flex flex-col w-full text-left p-3 md:p-5 rounded-xs border group relative overflow-hidden ${
        isSelected
          ? "border-primary-3 bg-primary-4 dark:border-primary-3 dark:bg-background-2 shadow-xs"
          : "border-border bg-background-2 dark:bg-background-3 hover:border-border-2"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3 w-full">
        <span className="text-base font-bold truncate text-foreground">
          #{sale.code.toString().padStart(6, "0")}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap ${status.bg} ${status.color}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isCanceled ? "bg-red-400" : "bg-emerald-400"
            }`}
          />
          {t(status.labelKey)}
        </span>
      </div>
      <AppCreatedBy
        name={sale.created_by_name}
        date={sale.created_at || sale.date}
        email={sale.created_by_email}
      />
      <div className="flex items-center justify-between w-full mt-3 pt-4 border-t border-border">
        <div className="flex items-center gap-1.5 text-label">
          <InventoryOutlined style={{ fontSize: 16 }} />
          <span className="text-sm">
            {sale.items_count} {t("labels.sales.items")}
          </span>
        </div>
        <span
          className={`text-base font-bold tabular-nums ${
            isCanceled ? "line-through text-label" : "text-foreground"
          }`}
        >
          {formatCurrency(sale.total)}
        </span>
      </div>
    </Link>
  );
}

function SaleFilterFields() {
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
    { id: SaleStatus.DONE, name: t("labels.sales.status.done") },
    { id: SaleStatus.CANCELED, name: t("labels.sales.status.canceled") },
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
            label={t("labels.sales.category")}
            placeholder={t("labels.sales.filter_category")}
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
            placeholder={t("labels.sales.filter_status")}
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
            label={t("labels.sales.product")}
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
          <AppDateRange label={t("labels.sales.detail.date")} {...field} />
        )}
      />

      <Controller
        control={control}
        name="total"
        render={({ field }) => (
          <AppAmountRange label={t("labels.sales.total")} {...field} />
        )}
      />
    </>
  );
}
