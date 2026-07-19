"use client";

import { useEffect, useMemo, useState } from "react";
import { STOCK_ENTRY_STATUS_CONFIG } from "@/app/utils/constants";
import { formatCurrency } from "@/app/utils/formatters/currency";
import { useParams, useRouter } from "next/navigation";
import AppPage from "@/app/components/AppPage";
import AppCard from "@/app/components/AppCard";
import AppButton from "@/app/components/AppButton";
import AppGrid from "@/app/components/AppGrid";
import AppLoading from "@/app/components/AppLoading";
import { usePagination } from "@/app/utils/usePagination";
import { stockEntriesService } from "@/api/services/StockEntryService";
import { stockEntryProductsService } from "@/api/services/StockEntryProductService";
import { StockEntry } from "@/api/schemas/StockEntry";
import { StockEntryProduct } from "@/api/schemas/StockEntryProduct";
import { StockEntryStatus } from "@/enums/StockEntryStatus";
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

export default function StockEntryDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { openDialog } = useDialogStore();
  const [stockEntry, setStockEntry] = useState<StockEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const productsPagination = usePagination<StockEntryProduct>(
    stockEntryProductsService,
    { stock_entry_id: id },
  );

  useEffect(() => {
    async function fetchStockEntry() {
      try {
        setLoading(true);
        const data = await stockEntriesService.getById(id);
        await productsPagination.load({
          params: { stock_entry_id: id, page: 1 },
        });
        setStockEntry(data);
      } catch (err: unknown) {
        const errorResponse = err as {
          response?: {
            data?: {
              error?: string;
              detail?: {
                error?: string;
                products?: string[];
                [key: string]: unknown;
              };
              products?: string[];
              [key: string]: unknown;
            };
          };
        };
        const errorData = errorResponse.response?.data;
        const detailData = errorData?.detail;
        const params = {
          ...errorData,
          ...(typeof detailData === "object" ? detailData : null),
        };
        const errorCode = params.error;
        openDialog({
          variant: "error",
          message: errorCode
            ? t(`errors.stock_entries.${errorCode}`, params)
            : t("errors.all.generic"),
        });
      } finally {
        setLoading(false);
      }
    }

    fetchStockEntry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleCancel() {
    if (!stockEntry) return;

    openDialog({
      variant: "confirm",
      title: t("labels.stock_entries.detail.cancel_title"),
      message: t("labels.stock_entries.detail.cancel_message", {
        code: stockEntry.id.split("-")[0].toUpperCase(),
      }),
      confirmLabel: t("labels.all.confirm"),
      cancelLabel: t("labels.all.close"),
      onConfirm: async () => {
        try {
          await stockEntriesService.cancel(stockEntry.id);
          const updated = await stockEntriesService.getById(stockEntry.id);
          setStockEntry(updated);
        } catch (err: unknown) {
          const errorResponse = err as {
            response?: {
              data?: {
                error?: string;
                detail?: {
                  error?: string;
                  products?: string[];
                  [key: string]: unknown;
                };
                products?: string[];
                [key: string]: unknown;
              };
            };
          };
          const errorData = errorResponse.response?.data;
          const detailData = errorData?.detail;
          const params = {
            ...errorData,
            ...(typeof detailData === "object" ? detailData : null),
          };
          const errorCode = params.error;
          openDialog({
            variant: "error",
            message: errorCode
              ? t(`errors.stock_entries.${errorCode}`, params)
              : t("errors.all.generic"),
          });
        }
      },
    });
  }

  const columns = useMemo(
    () => [
      {
        column: t("labels.sales.product"),
        cell: ({ row }: { row: StockEntryProduct }) => (
          <span className="font-medium">
            {row.product_name || "Desconhecido"}
          </span>
        ),
        size: 300,
      },
      {
        column: t("labels.sales.category"),
        cell: ({ row }: { row: StockEntryProduct }) => (
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: row.category_color || "#ccc" }}
            />
            <span>{row.category_name || "-"}</span>
          </div>
        ),
        size: 220,
      },
      {
        column: t("labels.sales.unit_price"),
        cell: ({ row }: { row: StockEntryProduct }) => (
          <span className="tabular-nums">{formatCurrency(row.unit_price)}</span>
        ),
        size: 130,
      },
      {
        column: t("labels.sales.qty"),
        cell: ({ row }: { row: StockEntryProduct }) => (
          <span className="tabular-nums font-medium">{row.quantity}</span>
        ),
        size: 80,
      },
      {
        column: t("labels.sales.subtotal"),
        cell: ({ row }: { row: StockEntryProduct }) => (
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
      <AppPage title={t("labels.stock_entries.detail.title")}>
        <AppLoading className="py-20" />
      </AppPage>
    );
  }

  if (!stockEntry) {
    return (
      <AppPage title={t("labels.stock_entries.detail.title")}>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-label">
            {t("labels.stock_entries.detail.not_found")}
          </p>
          <AppButton
            color="primary"
            flat
            onClick={() => router.push("/stock-entries")}
          >
            <ArrowBack fontSize="small" />
            {t("labels.stock_entries.detail.back")}
          </AppButton>
        </div>
      </AppPage>
    );
  }

  const isOpenStatus = stockEntry.status === StockEntryStatus.OPEN;

  return (
    <AppPage title={t("labels.stock_entries.detail.title")}>
      <AppButton
        color="transparent"
        flat
        onClick={() => router.push("/stock-entries")}
        className="gap-1.5! px-2! mr-auto mb-2"
      >
        <ArrowBackOutlined style={{ fontSize: 18 }} />
        <span className="text-sm">{t("labels.stock_entries.detail.back")}</span>
      </AppButton>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-foreground tracking-tight">
                #{stockEntry.code.toString().padStart(6, "0")}
              </h2>
              {(() => {
                const config = STOCK_ENTRY_STATUS_CONFIG[stockEntry.status] || {
                  bg: "bg-gray-500/10",
                  color: "text-gray-500",
                  labelKey: "labels.all.unknown",
                };
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
          <span className="text-label truncate text-sm mr-auto">
            {stockEntry.id}
          </span>
          {isOpenStatus && (
            <AppButton color="red" onClick={handleCancel}>
              {t("labels.stock_entries.detail.cancel_title")}
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
                {t("labels.stock_entries.detail.date")}
              </span>
              <span className="font-semibold">
                {formatDateTime(stockEntry.date)}
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
                {t("labels.stock_entries.detail.items")}
              </span>
              <span className="font-semibold">
                {stockEntry.items_count || 0}{" "}
                {(stockEntry.items_count || 0) === 1
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
                {formatCurrency(stockEntry.total)}
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
