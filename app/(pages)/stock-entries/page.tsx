"use client";

import { useEffect, useMemo } from "react";
import { STOCK_ENTRY_STATUS_CONFIG } from "@/app/utils/constants";
import Link from "next/link";
import { formatCurrency } from "@/app/utils/formatters/currency";
import { useRouter } from "next/navigation";
import { useFilterParams } from "../../utils/useFilterParams";
import AppPage from "../../components/AppPage";
import AppCard from "../../components/AppCard";
import AppGroup from "../../components/AppGroup";
import AppGrid from "../../components/AppGrid";
import {
  usePagination,
  type PaginationService,
} from "../../utils/usePagination";
import AppFilter from "../../components/AppFilter";
import AppSelectPaginated from "../../components/inputs/AppSelectPaginated";
import AppSelect from "../../components/inputs/AppSelect";
import { categoriesService } from "@/api/services/CategoryService";
import { Category } from "@/api/schemas/Category";
import { CategoryType } from "@/enums/CategoryType";
import { Product } from "@/api/schemas/Product";
import { productsService } from "@/api/services/ProductService";
import { StockEntryStatus } from "@/enums/StockEntryStatus";
import { Controller, useFormContext } from "react-hook-form";
import AppDateRange from "../../components/inputs/AppDateRange";
import AppAmountRange from "../../components/inputs/AppAmountRange";
import { StockEntry } from "@/api/schemas/StockEntry";
import { stockEntriesService } from "@/api/services/StockEntryService";
import { StockEntryProduct } from "@/api/schemas/StockEntryProduct";
import { formatDateTime } from "@/app/utils/formatters/date";
import { useTranslation } from "@/app/utils/i18n";
import {
  ShoppingCartOutlined,
  LocalShippingOutlined,
  TrendingDownOutlined,
} from "@mui/icons-material";

export default function StockEntriesPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const filterParams = useFilterParams([
    "start_date",
    "end_date",
    "start_total",
    "end_total",
    "category_id",
    "product_id",
    "status",
  ]);

  const stockPagination = usePagination<StockEntry>(stockEntriesService, {
    sort: "-code",
  });

  useEffect(() => {
    stockPagination.load({ params: filterParams });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppPage title={t("labels.stock_entries.title")}>
      <div className="flex gap-4 mb-5">
        <AppCard className="flex-1 p-4 flex-row! items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
            <LocalShippingOutlined
              className="text-sky-500"
              style={{ fontSize: 20 }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-label">
              {t("labels.stock_entries.list.purchases_today")}
            </span>
            <span className="text-lg font-bold text-foreground">0</span>
          </div>
        </AppCard>

        <AppCard className="flex-1 p-4 flex-row! items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
            <TrendingDownOutlined
              className="text-rose-500"
              style={{ fontSize: 20 }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-label">
              {t("labels.stock_entries.list.spent_today")}
            </span>
            <span className="text-lg font-bold text-foreground">
              {formatCurrency(0)}
            </span>
          </div>
        </AppCard>

        <AppCard className="flex-1 p-4 flex-row! items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
            <ShoppingCartOutlined
              className="text-teal-500"
              style={{ fontSize: 20 }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-label">
              {t("labels.stock_entries.list.spent_total")}
            </span>
            <span className="text-lg font-bold text-foreground">
              {formatCurrency(0)}
            </span>
          </div>
        </AppCard>
      </div>

      <AppGroup<StockEntry, StockEntryProduct>
        groups={stockPagination}
        search
        filter={
          <AppFilter
            pagination={stockPagination}
            validKeys={["date", "total", "category_id", "product_id", "status"]}
          >
            <StockEntryFilterFields />
          </AppFilter>
        }
        onNew={() => router.push("/stock-entries/new")}
        renderGroupName={(entry) => {
          const status = STOCK_ENTRY_STATUS_CONFIG[entry.status] || {
            bg: "bg-gray-500/10",
            color: "text-gray-500",
            labelKey: "labels.all.unknown",
          };

          return (
            <div className="flex items-center gap-5 w-full flex-1">
              <Link
                href={`/stock-entries/${entry.id}`}
                onClick={(e) => e.stopPropagation()}
                className="font-semibold hover:text-primary-3 dark:hover:text-primary hover:underline transition-all duration-200"
              >
                #{entry.code.toString().padStart(6, "0")}
              </Link>
              <span
                className={`text-sm font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}
              >
                {t(status.labelKey)}
              </span>
              <span className="text-sm text-label">
                {formatDateTime(entry.date)}
              </span>
              <span className="ml-auto text-sm rounded-full px-2 bg-white/10">
                {entry.items_count || 0}{" "}
                {(entry.items_count || 0) === 1
                  ? t("labels.sales.new.item_singular")
                  : t("labels.sales.new.item_plural")}
              </span>
              <span className="font-semibold">
                {formatCurrency(entry.total)}
              </span>
            </div>
          );
        }}
      >
        {({ group }) => <StockEntryProductsGrid entry={group} />}
      </AppGroup>
    </AppPage>
  );
}

import { stockEntryProductsService } from "@/api/services/StockEntryProductService";

function StockEntryProductsGrid({ entry }: { entry: StockEntry }) {
  const { t } = useTranslation();
  const pagination = usePagination<StockEntryProduct>(
    stockEntryProductsService,
  );

  useEffect(() => {
    pagination.load({ params: { stock_entry_id: entry.id, page: 1 } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.id]);

  const columns = useMemo(
    () => [
      {
        column: t("labels.sales.product"),
        cell: ({ row }: { row: StockEntryProduct }) =>
          row.product_name || "Desconhecido",
        size: 300,
      },
      {
        column: t("labels.sales.category"),
        cell: ({ row }: { row: StockEntryProduct }) => (
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: row.category_color || "#ccc" }}
            ></div>
            {row.category_name || "-"}
          </div>
        ),
        size: 250,
      },
      {
        column: t("labels.sales.unit_price"),
        cell: ({ row }: { row: StockEntryProduct }) =>
          formatCurrency(row.unit_price),
        size: 130,
      },
      {
        column: t("labels.sales.qty"),
        cell: ({ row }: { row: StockEntryProduct }) => row.quantity,
        size: 100,
      },
      {
        column: t("labels.sales.subtotal"),
        cell: ({ row }: { row: StockEntryProduct }) => (
          <span className="font-semibold">
            {formatCurrency(row.unit_price * row.quantity)}
          </span>
        ),
        size: 130,
      },
    ],
    [t],
  );

  return <AppGrid columns={columns} pagination={pagination} />;
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
            label={t("labels.sales.category")}
            placeholder={t("labels.sales.filter_category")}
            pagination={categories}
            search
            multiple
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
