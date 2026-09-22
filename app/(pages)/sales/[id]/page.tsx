"use client";

import { useEffect, useMemo, useState } from "react";
import { STATUS_CONFIG } from "@/app/utils/constants";
import { formatCurrency } from "@/app/utils/formatters/currency";
import { useParams, useRouter } from "next/navigation";
import AppGrid from "@/app/components/AppGrid";
import AppButton from "@/app/components/AppButton";
import { usePagination } from "@/app/utils/usePagination";
import { salesService } from "@/api/services/SaleService";
import { saleProductsService } from "@/api/services/SaleProductsService";
import { Sale } from "@/api/schemas/Sale";
import { SaleProduct } from "@/api/schemas/SaleProduct";
import { getApiError } from "@/api/schemas";
import { SaleStatus } from "@/enums/SaleStatus";
import { useDialogStore } from "@/stores/dialogStore";
import {
  ArrowBack,
  ArrowBackOutlined,
  HighlightOffOutlined,
  InventoryOutlined,
} from "@mui/icons-material";

import { formatDateTime } from "@/app/utils/formatters/date";
import { useTranslation } from "@/app/utils/i18n";
import { usePermission } from "@/app/utils/usePermission";
import AppCard from "@/app/components/AppCard";
import AppCreatedBy from "@/app/components/AppCreatedBy";
import { useSales } from "../SalesContext";

export default function SaleDetailPage() {
  const { t } = useTranslation();
  const { canEdit } = usePermission();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { openDialog } = useDialogStore();
  const salesContext = useSales();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

  const productsPagination = usePagination<SaleProduct>(saleProductsService, {
    sale_id: id,
  });

  useEffect(() => {
    async function fetchSale() {
      try {
        setLoading(true);
        const data = await salesService.getById(id);
        await productsPagination.load({ params: { sale_id: id, page: 1 } });
        setSale(data);
      } catch (err: unknown) {
        const error = err as {
          response?: { data?: { detail?: { error?: string } } };
        };
        openDialog({
          variant: "error",
          message: t(
            error.response?.data?.detail?.error
              ? `errors.sales.${error.response.data.detail.error}`
              : "errors.all.generic",
          ),
        });
      } finally {
        setLoading(false);
      }
    }

    fetchSale();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);


  async function handleCancel() {
    if (!sale) return;

    openDialog({
      variant: "confirm",
      title: t("labels.sales.detail.cancel_title"),
      message: t("labels.sales.detail.cancel_message", {
        code: sale.code.toString().padStart(6, "0"),
      }),
      confirmLabel: t("labels.all.confirm"),
      cancelLabel: t("labels.all.close"),
      onConfirm: async () => {
        try {
          await salesService.cancel(sale.id);
          const updated = await salesService.getById(sale.id);
          setSale(updated);
          salesContext?.updateSale(updated);
          salesContext?.refreshSales();
        } catch (err) {
          const { code, params } = getApiError(err);
          openDialog({
            variant: "error",
            message: t(
              code ? `errors.sales.${code}` : "errors.all.generic",
              params,
            ),
          });
        }
      },
    });
  }

  const columns = useMemo(
    () => [
      {
        column: t("labels.sales.product"),
        cell: ({ row }: { row: SaleProduct }) => (
          <span className="font-medium">{row.product_name}</span>
        ),
        size: 250,
      },
      {
        column: t("labels.sales.category"),
        cell: ({ row }: { row: SaleProduct }) => (
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-xs shrink-0"
              style={{ backgroundColor: row.category_color }}
            />
            <span className="text-sm">{row.category_name}</span>
          </div>
        ),
        size: 180,
      },
      {
        column: t("labels.sales.unit_price"),
        cell: ({ row }: { row: SaleProduct }) => (
          <span className="tabular-nums text-label">
            {formatCurrency(row.unit_price)}
          </span>
        ),
        size: 110,
      },
      {
        column: t("labels.sales.qty"),
        cell: ({ row }: { row: SaleProduct }) => (
          <span className="tabular-nums font-medium">{row.quantity}</span>
        ),
        size: 80,
      },
      {
        column: t("labels.sales.subtotal"),
        cell: ({ row }: { row: SaleProduct }) => (
          <span className="font-semibold tabular-nums text-foreground">
            {formatCurrency(row.unit_price * row.quantity)}
          </span>
        ),
        size: 130,
      },
    ],
    [t],
  );

  if (loading) {
    return (
      <div className="flex-1 flex justify-center py-20">
        <div className="text-label text-sm">{t("labels.all.processing")}</div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-label">{t("labels.sales.detail.not_found")}</p>
        <AppButton color="primary" flat onClick={() => router.push("/sales")}>
          <ArrowBack fontSize="small" />
          {t("labels.sales.new.back")}
        </AppButton>
      </div>
    );
  }

  const isCanceled = sale.status === SaleStatus.CANCELED;
  const status = STATUS_CONFIG[sale.status];

  return (
    <div className="flex flex-col flex-1 min-h-0 pb-6 pr-1">
      <div className="mb-2">
        <AppButton
          color="transparent"
          flat
          onClick={() => router.push("/sales")}
          className="gap-1.5! px-2!"
        >
          <ArrowBackOutlined style={{ fontSize: 18 }} />
          <span className="text-sm">{t("labels.sales.new.back")}</span>
        </AppButton>
      </div>

      <AppCard className="p-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-foreground">
                #{sale.code.toString().padStart(6, "0")}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full ${status.bg} ${status.color}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isCanceled ? "bg-red-400" : "bg-emerald-400"
                  }`}
                />
                {t(status.labelKey)}
              </span>
            </div>

            {canEdit && !isCanceled && (
              <AppButton
                color="background"
                onClick={handleCancel}
                className="px-3! py-1.5! ml-auto shrink-0"
              >
                <HighlightOffOutlined
                  style={{ fontSize: 16 }}
                  className="text-red-500"
                />
                {t("labels.sales.detail.cancel_title")}
              </AppButton>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-label">
            <span>{formatDateTime(sale.date)}</span>
            <span>|</span>
            <span>ID: {sale.id}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-xs text-label font-medium">
            {t("labels.all.created_by")}
          </span>
          <AppCreatedBy
            name={sale.created_by_name}
            email={sale.created_by_email}
          />
        </div>

        <div className="flex items-center justify-between w-full pt-4 border-t border-border">
          <div className="flex items-center gap-1.5 text-label">
            <InventoryOutlined style={{ fontSize: 16 }} />
            <span className="text-sm">
              {sale.items_count || 0} {t("labels.sales.items")}
            </span>
          </div>
          <span
            className={`text-lg font-bold tabular-nums ${
              isCanceled ? "line-through text-label" : "text-foreground"
            }`}
          >
            {formatCurrency(sale.total)}
          </span>
        </div>
      </AppCard>

      <div className="flex flex-col flex-1 min-h-0 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">
            {t("labels.products.title")}
            {productsPagination.pageData.total_items > 0 && (
              <span className="ml-2 text-sm font-normal text-label tabular-nums">
                ({productsPagination.pageData.total_items})
              </span>
            )}
          </h2>
        </div>

        <AppGrid columns={columns} pagination={productsPagination} />
      </div>
    </div>
  );
}
