"use client";

import { useEffect, useMemo, useState } from "react";
import { STATUS_CONFIG } from "@/app/utils/constants";
import { formatCurrency } from "@/app/utils/formatters/currency";
import { useParams, useRouter } from "next/navigation";
import AppPage from "@/app/components/AppPage";
import AppCard from "@/app/components/AppCard";
import AppButton from "@/app/components/AppButton";
import AppGrid from "@/app/components/AppGrid";
import AppLoading from "@/app/components/AppLoading";
import {
  usePagination,
  type PaginationService,
} from "@/app/utils/usePagination";
import { salesService } from "@/api/services/SaleService";
import { saleProductsService } from "@/api/services/SaleProductsService";
import { Sale } from "@/api/schemas/Sale";
import { SaleProduct } from "@/api/schemas/SaleProduct";
import { SaleStatus } from "@/enums/SaleStatus";
import { useDialogStore } from "@/stores/dialogStore";
import {
  ArrowBack,
  CalendarTodayOutlined,
  ShoppingBagOutlined,
  AttachMoneyOutlined,
  ArrowBackOutlined,
} from "@mui/icons-material";

import { formatDateTime } from "@/app/utils/formatters/date";
import { useTranslation } from "@/app/utils/i18n";

export default function SaleDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { openDialog } = useDialogStore();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

  const productsPagination = usePagination<SaleProduct>(
    saleProductsService as unknown as PaginationService<SaleProduct>,
    { sale_id: id },
  );

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
        size: 300,
      },
      {
        column: t("labels.sales.category"),
        cell: ({ row }: { row: SaleProduct }) => (
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: row.category_color }}
            />
            <span>{row.category_name}</span>
          </div>
        ),
        size: 220,
      },
      {
        column: t("labels.sales.unit_price"),
        cell: ({ row }: { row: SaleProduct }) => (
          <span className="tabular-nums">{formatCurrency(row.unit_price)}</span>
        ),
        size: 130,
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
        size: 140,
      },
    ],
    [t],
  );

  if (loading) {
    return (
      <AppPage title={t("labels.sales.detail.title")}>
        <AppLoading className="py-20" />
      </AppPage>
    );
  }

  if (!sale) {
    return (
      <AppPage title={t("labels.sales.detail.title")}>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-label">{t("labels.sales.detail.not_found")}</p>
          <AppButton color="primary" flat onClick={() => router.push("/sales")}>
            <ArrowBack fontSize="small" />
            {t("labels.sales.new.back")}
          </AppButton>
        </div>
      </AppPage>
    );
  }

  const isCanceled = sale.status === SaleStatus.CANCELED;

  return (
    <AppPage title={t("labels.sales.detail.title")}>
      <AppButton
        color="transparent"
        flat
        onClick={() => router.push("/sales")}
        className="gap-1.5! px-2! -ml-2 mr-auto mb-2"
      >
        <ArrowBackOutlined style={{ fontSize: 18 }} />
        <span className="text-sm">{t("labels.sales.new.back")}</span>
      </AppButton>
      <div className="flex flex-col gap-6">
        <div className="flex items-center  gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <h2 className=" font-bold text-foreground tracking-tight">
                #{sale.code.toString().padStart(6, "0")}
              </h2>
              {(() => {
                const config = STATUS_CONFIG[sale.status];
                return (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}
                  >
                    {t(config.labelKey)}
                  </span>
                );
              })()}
            </div>
          </div>
          <span className="text-label truncate text-sm mr-auto">{sale.id}</span>
          {!isCanceled && (
            <AppButton color="red" onClick={handleCancel}>
              {t("labels.sales.detail.cancel_title")}
            </AppButton>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AppCard className="p-5 flex-row! items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
              <CalendarTodayOutlined
                className="text-indigo-500"
                style={{ fontSize: 20 }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-label">
                {t("labels.sales.detail.date")}
              </span>
              <span className="font-semibold">
                {formatDateTime(sale.created_at)}
              </span>
            </div>
          </AppCard>

          <AppCard className="p-5 flex-row! items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
              <ShoppingBagOutlined
                className="text-orange-500"
                style={{ fontSize: 20 }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-label">
                {t("labels.sales.detail.items")}
              </span>
              <span className="font-semibold">
                {sale.items_count}{" "}
                {sale.items_count === 1
                  ? t("labels.sales.new.item_singular")
                  : t("labels.sales.new.item_plural")}
              </span>
            </div>
          </AppCard>

          <AppCard className="p-5 flex-row! items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0">
              <AttachMoneyOutlined
                className="text-teal-500"
                style={{ fontSize: 20 }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-label">{t("labels.sales.new.total")}</span>
              <span className="font-semibold">
                {formatCurrency(sale.total)}
              </span>
            </div>
          </AppCard>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">
              {t("labels.products.title")}
            </h3>
          </div>
          <AppGrid columns={columns} pagination={productsPagination} />
        </div>
      </div>
    </AppPage>
  );
}
