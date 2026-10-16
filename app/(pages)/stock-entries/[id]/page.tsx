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
  ArrowBackOutlined,
  DeleteOutlined,
  HighlightOffOutlined,
  InventoryOutlined,
} from "@mui/icons-material";

import { formatDateTime } from "@/app/utils/formatters/date";
import { useTranslation } from "@/app/utils/i18n";
import { usePermission } from "@/app/utils/usePermission";
import AppCard from "@/app/components/AppCard";
import AppCreatedBy from "@/app/components/AppCreatedBy";
import { useStockEntries } from "../StockEntriesContext";

export default function StockEntryDetailPage() {
  const { t } = useTranslation();
  const { canEdit } = usePermission();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { openDialog } = useDialogStore();
  const stockContext = useStockEntries();
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
          stockContext?.updateStockEntry(updated);
          stockContext?.refreshStockEntries();
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

  async function handleDelete() {
    if (!stockEntry) return;

    openDialog({
      variant: "confirm",
      title: t("labels.stock_entries.detail.delete_title"),
      message: t("labels.stock_entries.detail.delete_message", {
        code: stockEntry.code.toString().padStart(6, "0"),
      }),
      confirmLabel: t("labels.all.delete"),
      cancelLabel: t("labels.all.close"),
      onConfirm: async () => {
        try {
          await stockEntriesService.delete(stockEntry.id);
          stockContext?.refreshStockEntries();
          router.push("/stock-entries");
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
              className="w-2.5 h-2.5 rounded-xs shrink-0"
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

      <AppCard className="p-3.5 sm:p-5 flex flex-col gap-3.5 sm:gap-4">
        <div className="flex flex-col gap-2 sm:gap-1.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 w-full">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-lg sm:text-xl font-bold text-foreground">
                #{stockEntry.code.toString().padStart(6, "0")}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full ${status.bg} ${status.color}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isCanceled ? "bg-red-400" : "bg-emerald-400"
                  }`}
                />
                {t(status.labelKey)}
              </span>
            </div>

            {canEdit && isOpenStatus && (
              <AppButton
                onClick={handleCancel}
                color="background"
                className="px-3! py-1.5! self-start sm:self-auto sm:ml-auto shrink-0 text-xs sm:text-sm"
              >
                <HighlightOffOutlined
                  style={{ fontSize: 16 }}
                  className="text-red-500"
                />
                {t("labels.stock_entries.detail.cancel_title")}
              </AppButton>
            )}

            {canEdit && isCanceled && (
              <AppButton
                color="background"
                onClick={handleDelete}
                className="px-3! py-1.5! self-start sm:self-auto sm:ml-auto shrink-0 text-xs sm:text-sm text-red-500 hover:text-red-600 hover:border-red-300 dark:hover:border-red-700"
              >
                <DeleteOutlined
                  style={{ fontSize: 16 }}
                  className="text-red-500"
                />
                {t("labels.stock_entries.detail.delete_title")}
              </AppButton>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-label">
            <span>{formatDateTime(stockEntry.date)}</span>
            <span className="hidden min-[400px]:inline">|</span>
            <span className="break-all">ID: {stockEntry.id}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-xs text-label font-medium">
            {t("labels.all.created_by")}
          </span>
          <AppCreatedBy
            name={stockEntry.created_by_name}
            email={stockEntry.created_by_email}
            avatarUrl={stockEntry.created_by_avatar_url}
          />
        </div>

        <div className="flex flex-col gap-2 w-full pt-3 sm:pt-4 border-t border-border">
          {stockEntry.discount && stockEntry.discount > 0 ? (
            <>
              <div className="flex items-center justify-between text-xs sm:text-sm text-label">
                <span>{t("labels.all.subtotal")}</span>
                <span className="tabular-nums">
                  {formatCurrency(stockEntry.total + stockEntry.discount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm text-label">
                <span>{t("labels.all.discount")}</span>
                <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
                  -{formatCurrency(stockEntry.discount)}
                </span>
              </div>
            </>
          ) : null}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 text-label">
              <InventoryOutlined style={{ fontSize: 16 }} />
              <span className="text-xs sm:text-sm">
                {stockEntry.items_count || 0} {t("labels.stock_entries.items")}
              </span>
            </div>
            <span
              className={`text-base sm:text-lg font-bold tabular-nums ${
                isCanceled ? "line-through text-label" : "text-foreground"
              }`}
            >
              {formatCurrency(stockEntry.total)}
            </span>
          </div>
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
