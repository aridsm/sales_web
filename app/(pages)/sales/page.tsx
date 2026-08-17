"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { STATUS_CONFIG } from "@/app/utils/constants";
import { formatCurrency } from "@/app/utils/formatters/currency";
import { useRouter } from "next/navigation";

import AppPage from "../../components/AppPage";
import AppCard from "../../components/AppCard";
import Link from "next/link";
import AppGroup from "../../components/AppGroup";
import AppGrid from "../../components/AppGrid";
import {
  usePagination,
  type PaginationService,
} from "../../utils/usePagination";
import AppFilter from "../../components/AppFilter";
import { Controller, useFormContext } from "react-hook-form";
import AppSelectPaginated from "../../components/inputs/AppSelectPaginated";
import AppSelect from "../../components/inputs/AppSelect";
import { categoriesService } from "@/api/services/CategoryService";
import { Category } from "@/api/schemas/Category";
import { CategoryType } from "@/enums/CategoryType";
import {
  TrendingUpOutlined,
  ReceiptOutlined,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import { Sale } from "@/api/schemas/Sale";
import { salesService } from "@/api/services/SaleService";
import { SaleProduct } from "@/api/schemas/SaleProduct";
import { saleProductsService } from "@/api/services/SaleProductsService";
import { formatDateTime } from "@/app/utils/formatters/date";
import { useTranslation } from "@/app/utils/i18n";
import AppDateRange from "../../components/inputs/AppDateRange";
import { Product } from "@/api/schemas/Product";
import { productsService } from "@/api/services/ProductService";
import AppAmountRange from "../../components/inputs/AppAmountRange";
import { SaleStatus } from "@/enums/SaleStatus";

export default function SalePage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [filterParams, setFilterParams] = useState<Record<string, unknown>>({});
  const handleFilterChange = useCallback(
    (params: Record<string, unknown>) => setFilterParams(params),
    [],
  );
  const salesPagination = usePagination<Sale>(salesService, { sort: "-code" });

  useEffect(() => {
    salesPagination.load({ replace: true, params: filterParams });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterParams]);

  return (
    <AppPage title={t("labels.sales.title")}>
      <div className="flex gap-4 mb-5">
        <AppCard className="flex-1 p-4 flex-row! items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
            <ShoppingCartOutlined
              className="text-sky-500"
              style={{ fontSize: 20 }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-label">{t("labels.sales.sales_today")}</span>
            <span className="text-lg font-bold text-foreground">0</span>
          </div>
        </AppCard>

        <AppCard className="flex-1 p-4 flex-row! items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
            <TrendingUpOutlined
              className="text-teal-500"
              style={{ fontSize: 20 }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-label">
              {t("labels.sales.revenue_today")}
            </span>
            <span className="text-lg font-bold text-foreground">
              {formatCurrency(0)}
            </span>
          </div>
        </AppCard>

        <AppCard className="flex-1 p-4 flex-row! items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
            <ReceiptOutlined
              className="text-rose-500"
              style={{ fontSize: 20 }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-label">
              {t("labels.sales.total_revenue")}
            </span>
            <span className="text-lg font-bold text-foreground">
              {formatCurrency(0)}
            </span>
          </div>
        </AppCard>
      </div>

      <AppGroup<Sale, SaleProduct>
        groups={salesPagination}
        search
        filter={
          <AppFilter
            onChange={handleFilterChange}
            validKeys={["category_id", "status", "product_id", "date", "total"]}
          >
            <SaleFilterFields />
          </AppFilter>
        }
        onNew={() => router.push("/sales/new")}
        renderGroupName={(sale) => {
          const status = STATUS_CONFIG[sale.status];

          return (
            <div className="flex items-center gap-5 w-full flex-1">
              <Link
                href={`/sales/${sale.id}`}
                onClick={(e) => e.stopPropagation()}
                className="font-semibold hover:text-primary-3 dark:hover:text-primary hover:underline transition-all duration-200"
              >
                {sale.code.toString().padStart(6, "0")}
              </Link>
              <span
                className={`text-sm font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}
              >
                {t(status.labelKey)}
              </span>
              <span className="text-sm text-label">
                {formatDateTime(sale.date)}
              </span>
              <span className=" ml-auto text-sm rounded-full px-2  bg-white/10">
                {sale.items_count} {t("labels.sales.items")}
              </span>{" "}
              <span className="font-semibold">
                {formatCurrency(sale.total)}
              </span>
            </div>
          );
        }}
      >
        {({ group }) => <SaleProductsGrid sale={group} />}
      </AppGroup>
    </AppPage>
  );
}

function SaleProductsGrid({ sale }: { sale: Sale }) {
  const { t } = useTranslation();
  const pagination = usePagination<SaleProduct>(saleProductsService);

  useEffect(() => {
    pagination.load({ params: { sale_id: sale.id, page: 1 } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sale.id]);

  const columns = useMemo(
    () => [
      {
        column: t("labels.sales.product"),
        cell: ({ row }: { row: SaleProduct }) => row.product_name,
        size: 300,
      },
      {
        column: t("labels.sales.category"),
        cell: ({ row }: { row: SaleProduct }) => (
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-sm"
              style={{
                backgroundColor: row.category_color,
              }}
            ></div>
            {row.category_name}
          </div>
        ),
        size: 250,
      },
      {
        column: t("labels.sales.unit_price"),
        cell: ({ row }: { row: SaleProduct }) => formatCurrency(row.unit_price),
        size: 130,
      },
      {
        column: t("labels.sales.quantity"),
        cell: ({ row }: { row: SaleProduct }) => row.quantity,
        size: 100,
      },
      {
        column: t("labels.sales.subtotal"),
        cell: ({ row }: { row: SaleProduct }) => (
          <span className="font-semibold">
            {formatCurrency(row.unit_price * row.quantity)}
          </span>
        ),
        size: 130,
      },
    ],
    [t],
  );

  return <AppGrid columns={columns} pagination={pagination} className="mt-3" />;
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
            label="Status"
            placeholder="Filtrar por status"
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
