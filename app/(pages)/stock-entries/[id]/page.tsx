"use client";

import { useEffect, useMemo, useState } from "react";
import { STOCK_ENTRY_STATUS_CONFIG } from "@/app/utils/constants";
import { formatCurrency } from "@/app/utils/formatters/currency";
import { useParams, useRouter } from "next/navigation";
import AppGrid from "@/app/components/AppGrid";
import AppButton from "@/app/components/AppButton";
import { usePagination } from "@/app/utils/usePagination";
import { stockEntriesService } from "@/api/services/StockEntryService";
import { stockEntryProductsService } from "@/api/services/StockEntryProductService";
import { StockEntry } from "@/api/schemas/StockEntry";
import { StockEntryProduct } from "@/api/schemas/StockEntryProduct";
import { getApiError } from "@/api/schemas";
import { StockEntryStatus } from "@/enums/StockEntryStatus";
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
import AppCard from "@/app/components/AppCard";

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
        code: stockEntry.code.toString().padStart(6, "0"),
      }),
      confirmLabel: t("labels.all.confirm"),
      cancelLabel: t("labels.all.close"),
      onConfirm: async () => {
        try {
          await stockEntriesService.cancel(stockEntry.id);
          const updated = await stockEntriesService.getById(stockEntry.id);
          setStockEntry(updated);
        } catch (err) {
          const { code, params } = getApiError(err);
          openDialog({
            variant: "error",
            message: t(
              code ? `errors.stock_entries.${code}` : "errors.all.generic",
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
        column: t("labels.stock_entries.product"),
        cell: ({ row }: { row: StockEntryProduct }) => (
          <span className="font-medium">
            {row.product_name || "Desconhecido"}
          </span>
        ),
        size: 250,
      },
      {
        column: t("labels.stock_entries.category"),
        cell: ({ row }: { row: StockEntryProduct }) => (
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: row.category_color || "#ccc" }}
            />
            <span className="text-sm">{row.category_name || "-"}</span>
          </div>
        ),
        size: 180,
      },
      {
        column: t("labels.stock_entries.unit_price"),
        cell: ({ row }: { row: StockEntryProduct }) => (
          <span className="tabular-nums text-label">
            {formatCurrency(row.unit_price)}
          </span>
        ),
        size: 110,
      },
      {
        column: t("labels.stock_entries.qty"),
        cell: ({ row }: { row: StockEntryProduct }) => (
          <span className="tabular-nums font-medium">{row.quantity}</span>
        ),
        size: 80,
      },
      {
        column: t("labels.stock_entries.subtotal"),
        cell: ({ row }: { row: StockEntryProduct }) => (
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

  if (!stockEntry) {
    return (
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
    );
  }

  const isOpenStatus = stockEntry.status === StockEntryStatus.OPEN;
  const status = STOCK_ENTRY_STATUS_CONFIG[stockEntry.status] || {
    bg: "bg-gray-500/10",
    color: "text-gray-500",
    labelKey: "labels.all.unknown",
  };
  const isCanceled = stockEntry.status === StockEntryStatus.CANCELED;

  return (
    <div className="flex flex-col flex-1 min-h-0 pb-6 pr-1">
      <div className="mb-2">
        <AppButton
          color="transparent"
          flat
          onClick={() => router.push("/stock-entries")}
          className="gap-1.5! px-2!"
        >
          <ArrowBackOutlined style={{ fontSize: 18 }} />
          <span className="text-sm">
            {t("labels.stock_entries.detail.back")}
          </span>
        </AppButton>
      </div>

      <AppCard className="flex flex-col p-5">
        <div className="flex flex-col gap-1.5 w-full mb-4">
          <div className="flex items-center gap-3 w-full">
            <span className="text-2xl font-bold text-foreground">
              #{stockEntry.code.toString().padStart(6, "0")}
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

            {isOpenStatus && (
              <AppButton
                onClick={handleCancel}
                color="background"
                className="px-3! py-1.5! ml-auto"
              >
                <HighlightOffOutlined
                  style={{ fontSize: 16 }}
                  className="text-red-500"
                />
                {t("labels.stock_entries.detail.cancel_title")}
              </AppButton>
            )}
          </div>
          <span className="text-label">{formatDateTime(stockEntry.date)}</span>
          <span className="text-label/60 mt-1">{stockEntry.id}</span>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
          <StockEntryStatBlock
            label={t("labels.stock_entries.detail.date")}
            value={formatDate(stockEntry.created_at)}
            icon={<CalendarTodayOutlined style={{ fontSize: 18 }} />}
          />
          <StockEntryStatBlock
            label={t("labels.stock_entries.detail.items")}
            value={(stockEntry.items_count || 0).toString()}
            icon={<ShoppingBagOutlined style={{ fontSize: 18 }} />}
          />
          <StockEntryStatBlock
            label={t("labels.stock_entries.new.total")}
            value={formatCurrency(stockEntry.total)}
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

function StockEntryStatBlock({
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
        className={`w-9 h-9 rounded-lg bg-primary-4 dark:bg-primary-3 flex items-center justify-center shrink-0`}
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
