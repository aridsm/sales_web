"use client";

import { useEffect, useMemo } from "react";
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
import AppInputText from "../../components/inputs/AppInputText";
import { categoriesService } from "@/api/services/Categories";
import { CategoryType } from "@/enums/CategoryType";
import {
  TrendingUpOutlined,
  ReceiptOutlined,
  ShoppingCartOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import { SaleStatus } from "@/enums/SaleStatus";
import { Sale } from "@/api/schemas/Sale";
import { salesService } from "@/api/services/SaleService";
import { SaleProduct } from "@/api/schemas/SaleProduct";
import { saleProductsService } from "@/api/services/SaleProductsService";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

const statusConfig: Record<
  SaleStatus,
  { label: string; color: string; bg: string }
> = {
  [SaleStatus.DONE]: {
    label: "Concluída",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  [SaleStatus.CANCELED]: {
    label: "Cancelada",
    color: "text-red-500 dark:text-red-400",
    bg: "bg-red-500/10",
  },
};

export default function SalePage() {
  const router = useRouter();

  const salesPagination = usePagination<Sale>(salesService);

  useEffect(() => {
    salesPagination.load({ params: { page: 1 } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppPage title="Vendas">
      <div className="flex gap-4 mb-5">
        <AppCard className="flex-1 p-4 flex-row! items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <ShoppingCartOutlined
              className="text-primary"
              style={{ fontSize: 20 }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-label">Vendas hoje</span>
            <span className="text-lg font-bold text-foreground">0</span>
          </div>
        </AppCard>

        <AppCard className="flex-1 p-4 flex-row! items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <TrendingUpOutlined
              className="text-emerald-500"
              style={{ fontSize: 20 }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-label">Faturamento hoje</span>
            <span className="text-lg font-bold text-foreground">
              {formatCurrency(0)}
            </span>
          </div>
        </AppCard>

        <AppCard className="flex-1 p-4 flex-row! items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
            <ReceiptOutlined
              className="text-violet-500"
              style={{ fontSize: 20 }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-label">Total de vendas</span>
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
          <AppFilter pagination={salesPagination}>
            <SaleFilterFields />
          </AppFilter>
        }
        onNew={() => router.push("/sales/new")}
        renderGroupName={(sale) => {
          const status = statusConfig[sale.status];

          return (
            <div className="flex items-center gap-5 w-full flex-1">
              <Link
                href={`/sales/${sale.id}`}
                onClick={(e) => e.stopPropagation()}
                className="font-semibold hover:text-primary dark:hover:text-primary-2 hover:underline transition-all duration-200"
              >
                {sale.code.toString().padStart(6, "0")}
              </Link>
              <span
                className={`text-sm font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}
              >
                {status.label}
              </span>
              <span className="text-sm text-label">
                {formatDate(sale.created_at)}
              </span>
              <span className="text-sm text-label">
                {sale.items_count} itens
              </span>{" "}
              <span className="font-semibold ml-auto">
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
  const pagination = usePagination<SaleProduct>(saleProductsService);

  useEffect(() => {
    pagination.load({ params: { sale_id: sale.id, page: 1 } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sale.id]);

  const columns = useMemo(
    () => [
      {
        column: "Produto",
        cell: ({ row }: { row: SaleProduct }) => row.product_name,
        size: 300,
      },
      {
        column: "Categoria",
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
        column: "Preço un.",
        cell: ({ row }: { row: SaleProduct }) => formatCurrency(row.unit_price),
        size: 130,
      },
      {
        column: "Quantidade",
        cell: ({ row }: { row: SaleProduct }) => row.quantity,
        size: 100,
      },
      {
        column: "Subtotal",
        cell: ({ row }: { row: SaleProduct }) => (
          <span className="font-semibold">
            {formatCurrency(row.unit_price * row.quantity)}
          </span>
        ),
        size: 130,
      },
    ],
    [],
  );

  return <AppGrid columns={columns} pagination={pagination} />;
}

function SaleFilterFields() {
  const { control, register } = useFormContext();

  const categories = usePagination<any>(
    categoriesService as unknown as PaginationService<any>,
    { type: CategoryType.PRODUCT, page_size: 20 },
  );

  useEffect(() => {
    categories.load({ params: { page: 1 } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Controller
        control={control}
        name="category_id"
        render={({ field }) => (
          <AppSelectPaginated
            label="Categoria"
            placeholder="Filtrar por categoria"
            pagination={categories}
            search
            multiple
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <AppInputText
        label="Código"
        placeholder="Buscar por código"
        {...register("code")}
      />
    </>
  );
}
