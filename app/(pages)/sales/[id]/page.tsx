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
  CalendarTodayOutlined,
  ShoppingBagOutlined,
  AttachMoneyOutlined,
  ArrowBackOutlined,
  HighlightOffOutlined,
} from "@mui/icons-material";

import { formatDateTime, formatDate } from "@/app/utils/formatters/date";
import { useTranslation } from "@/app/utils/i18n";
import { usePermission } from "@/app/utils/usePermission";
import AppCard from "@/app/components/AppCard";

export default function SaleDetailPage() {
  const { t } = useTranslation();
  const { canEdit } = usePermission();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { openDialog } = useDialogStore();
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
              className="w-2.5 h-2.5 rounded-sm shrink-0"
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

      <AppCard className="flex flex-col p-5">
        <div className="flex flex-col gap-1.5 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-foreground">
              #{sale.code.toString().padStart(6, "0")}
            </span>

            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${status.bg} ${status.color}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isCanceled ? "bg-red-400" : "bg-emerald-400"
                }`}
              />
              {t(status.labelKey)}
            </span>

            {canEdit && !isCanceled && (
              <AppButton
                color="background"
                onClick={handleCancel}
                className="px-3! py-1.5! ml-auto"
              >
                <HighlightOffOutlined
                  style={{ fontSize: 16 }}
                  className="text-red-500"
                />
                {t("labels.sales.detail.cancel_title")}
              </AppButton>
            )}
          </div>
          <span className=" text-label">{formatDateTime(sale.date)}</span>
          <span className="text-label/60 mt-1">{sale.id}</span>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
          <SaleStatBlock
            label={t("labels.sales.detail.date")}
            value={formatDate(sale.created_at)}
            icon={<CalendarTodayOutlined style={{ fontSize: 18 }} />}
          />
          <SaleStatBlock
            label={t("labels.sales.detail.items")}
            value={sale.items_count.toString()}
            icon={<ShoppingBagOutlined style={{ fontSize: 18 }} />}
          />
          <SaleStatBlock
            label={t("labels.sales.new.total")}
            value={formatCurrency(sale.total)}
            icon={<AttachMoneyOutlined style={{ fontSize: 18 }} />}
          />
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

function SaleStatBlock({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <AppCard className="flex flex-row items-center gap-3 p-3">
      <div
        className={`w-9 h-9 rounded-lg  bg-primary-4 dark:bg-primary-3 flex items-center justify-center shrink-0`}
      >
        <span className="text-primary-3 dark:text-white -mt-1">{icon}</span>
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-bold tracking-wider truncate">
          {label}
        </span>
        <span className="text-sm tabular-nums">{value}</span>
      </div>
    </AppCard>
  );
}
