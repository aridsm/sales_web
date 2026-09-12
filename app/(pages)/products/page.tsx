"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDateTime } from "@/app/utils/formatters/date";
import AppCreatedBy from "@/app/components/AppCreatedBy";
import AppPage from "../../components/AppPage";
import {
  usePagination,
  type PaginationService,
} from "../../utils/usePagination";
import { useDebounce } from "../../utils/useDebounce";
import { categoriesService } from "@/api/services/CategoryService";
import { productsService } from "@/api/services/ProductService";
import { CategoryType } from "@/enums/CategoryType";
import { useDialogStore } from "@/stores/dialogStore";
import AppFilter from "../../components/AppFilter";
import { Controller, useFormContext } from "react-hook-form";
import AppProductForm, {
  type ProductFormValues,
} from "./components/AppProductForm";
import { Edit, Add, DeleteOutlined, ErrorTwoTone } from "@mui/icons-material";
import AppModal from "@/app/components/AppModal";
import AppGrid from "@/app/components/AppGrid";
import AppButton from "@/app/components/AppButton";
import AppSearchInput from "@/app/components/inputs/AppSearchInput";
import AppLoading from "@/app/components/AppLoading";
import { useTranslation } from "@/app/utils/i18n";
import { Category } from "@/api/schemas/Category";
import { Product } from "@/api/schemas/Product";
import { getApiError } from "@/api/schemas";
import { usePermission } from "../../utils/usePermission";
import AppDateRange from "../../components/inputs/AppDateRange";
import AppAmountRange from "../../components/inputs/AppAmountRange";
import AppNumberRange from "../../components/inputs/AppNumberRange";

const VALID_FILTER_KEYS = ["created_at", "price", "stock_amount"];

export default function ProductsPage() {
  const { t } = useTranslation();
  const { canEdit } = usePermission();
  const [rowsSelected, setRowsSelected] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | number | null
  >(null);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearchInput = useDebounce(searchInput, 500);
  const [filterParams, setFilterParams] = useState<Record<string, unknown>>({});

  const [form, setForm] = useState({
    open: false,
    item: {} as ProductFormValues,
  });
  const { openDialog } = useDialogStore();

  // Fetch categories for sidebar
  const categories = usePagination<Category>(
    categoriesService as unknown as PaginationService<Category>,
    { type: CategoryType.PRODUCT, page_size: 50 },
  );

  const products = usePagination<Product>(
    productsService as unknown as PaginationService<Product>,
  );

  useEffect(() => {
    categories.load({
      params: { type: CategoryType.PRODUCT, page_size: 50 },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch products whenever search, category or filter params change.
  useEffect(() => {
    products.load({
      replace: true,
      params: {
        category_id: selectedCategoryId || undefined,
        search: debouncedSearchInput,
        ...filterParams,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId, debouncedSearchInput, filterParams]);

  // Stable callback passed to AppFilter as onChange.
  const handleFilterChange = useCallback((params: Record<string, unknown>) => {
    setFilterParams(params);
  }, []);

  function onDeleteSelected() {
    openDialog({
      variant: "confirm",
      title: t("labels.products.delete_title"),
      message:
        rowsSelected.length === 1
          ? t("labels.products.delete_single")
          : t("labels.products.delete_multiple", {
              count: rowsSelected.length,
            }),
      confirmLabel: t("labels.all.delete"),
      onConfirm: async () => {
        try {
          const ids = rowsSelected.map((item) => item.id);
          await productsService.bulkDelete(ids);
          await Promise.all([products.load(), categories.load()]);
          setRowsSelected([]);
        } catch (err) {
          const { code, params } = getApiError(err);
          openDialog({
            variant: "error",
            message: t(
              code ? `errors.products.${code}` : "errors.all.generic",
              params,
            ),
          });
        }
      },
    });
  }

  async function onSaveItem() {
    await Promise.all([products.load(), categories.load()]);
  }

  function onCloseForm() {
    setForm((prev) => ({
      ...prev,
      open: false,
    }));
  }

  const columns = useMemo(
    () => [
      {
        column: t("labels.all.name"),
        cell: ({ row }: { row: Product }) => (
          <span className="font-medium text-foreground">{row.name}</span>
        ),
        size: 250,
      },
      {
        column: t("labels.products.category"),
        cell: ({ row }: { row: Product }) => (
          <div className="flex items-center gap-2 whitespace-nowrap">
            {row.category_color && (
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: row.category_color }}
              />
            )}
            <span className=" px-2 py-0.5 rounded-full bg-background-3 text-foreground/80 border border-border">
              {row.category_name || "-"}
            </span>
          </div>
        ),
        size: 220,
      },
      {
        column: t("labels.products.price"),
        cell: ({ row }: { row: Product }) => {
          return row.price !== undefined
            ? new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(row.price)
            : "-";
        },
        size: 140,
      },
      {
        column: t("labels.products.stock_amount"),
        cell: ({ row }: { row: Product }) => {
          let className = "";

          if (row.stock_amount == 0) {
            className = "text-red-500 font-semibold";
          } else if (row.stock_amount <= 5) {
            className = "text-amber-500 font-semibold";
          }

          return (
            <span className={`${className} flex items-center gap-1`}>
              {row.stock_amount <= 5 && <ErrorTwoTone fontSize="small" />}
              {row.stock_amount}
            </span>
          );
        },
        size: 160,
      },
      {
        column: t("labels.products.sold_amount"),
        cell: ({ row }: { row: Product }) => row.sold_amount,
        size: 130,
      },
      {
        column: t("labels.all.created_by"),
        cell: ({ row }: { row: Product }) => (
          <AppCreatedBy
            name={row.created_by_name}
            date={row.created_at}
            email={row.created_by_email}
          />
        ),
        size: 280,
      },
      {
        column: "ID",
        cell: ({ row }: { row: Product }) => row.id,
        size: 360,
      },
    ],
    [t],
  );

  const actions = useMemo(
    () => [
      {
        text: t("labels.all.edit"),
        preText: <Edit fontSize="small" />,
        click: (product: Product) => {
          setForm({
            open: true,
            item: product,
          });
        },
      },
    ],
    [t],
  );

  const totalProductsCount = useMemo(() => {
    return categories.items.reduce((acc, cat) => acc + (cat.products || 0), 0);
  }, [categories.items]);

  return (
    <AppPage title={t("labels.products.title")}>
      <div className="flex flex-col flex-1 gap-4 min-h-0">
        <div className="flex flex-col min-[1100px]:flex-row flex-1 gap-3 min-h-0 overflow-hidden">
          <div className="w-full min-[1100px]:w-70 shrink-0 bg-background-2 dark:bg-background-3 border border-border rounded-lg flex flex-col overflow-hidden">
            <div className="hidden min-[1100px]:flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-semibold">
                {t("labels.categories.title")}
              </span>
              <span className="text-sm bg-foreground/8 text-foreground/60 px-1.5 py-0.5 rounded-md font-medium tabular-nums">
                {categories.items.length}
              </span>
            </div>

            <div className="flex min-[1100px]:flex-col flex-row items-center min-[1100px]:items-stretch gap-1.5 min-[1100px]:gap-0.5 p-1.5 min-[1100px]:p-2 overflow-x-auto min-[1100px]:overflow-y-auto min-[1100px]:flex-1">
              <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-foreground/50 uppercase tracking-wider shrink-0 min-[1100px]:hidden select-none">
                {t("labels.categories.title")}
              </div>
              <div className="w-px h-4 bg-border shrink-0 min-[1100px]:hidden" />

              <button
                type="button"
                onClick={() => setSelectedCategoryId(null)}
                className={`shrink-0 min-[1100px]:w-full flex items-center justify-between gap-2 px-3 py-1.5 min-[1100px]:p-3 rounded-lg transition-all duration-150 cursor-pointer group whitespace-nowrap text-xs min-[1100px]:text-sm ${
                  selectedCategoryId === null
                    ? "bg-primary-4 dark:bg-primary-3 text-primary-3 dark:text-white font-semibold"
                    : "text-foreground/70 hover:bg-background dark:hover:bg-foreground/5 hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2 min-[1100px]:gap-2.5 truncate">
                  <div
                    className={`w-2 h-3 min-[1100px]:w-2.5 min-[1100px]:h-4 rounded-xs shrink-0 transition-colors ${
                      selectedCategoryId === null
                        ? "bg-primary-3 dark:bg-white"
                        : "bg-foreground/25"
                    }`}
                  />
                  <span className="truncate">{t("labels.categories.all")}</span>
                </div>
                <span
                  className={`text-xs min-[1100px]:text-sm tabular-nums px-1.5 py-0.5 rounded-md transition-colors ml-1.5 min-[1100px]:ml-2 ${
                    selectedCategoryId === null
                      ? "bg-primary-3/20 text-primary-3 dark:bg-white/20 dark:text-white font-semibold"
                      : "text-foreground/40 group-hover:text-foreground/60"
                  }`}
                >
                  {totalProductsCount}
                </span>
              </button>

              <div className="w-px h-5 bg-border mx-1 shrink-0 min-[1100px]:w-auto min-[1100px]:h-px min-[1100px]:mx-2 min-[1100px]:my-1" />

              {categories.loading && !categories.items.length ? (
                <div className="p-2 min-[1100px]:p-6 text-center shrink-0">
                  <AppLoading />
                </div>
              ) : categories.items.length === 0 ? (
                <div className="p-2 min-[1100px]:p-6 text-center text-xs min-[1100px]:text-sm text-foreground/40 shrink-0">
                  {t("labels.categories.no_category")}
                </div>
              ) : (
                categories.items.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`shrink-0 min-[1100px]:w-full flex items-center justify-between gap-2 px-3 py-1.5 min-[1100px]:p-3 rounded-lg transition-all duration-150 cursor-pointer group whitespace-nowrap text-xs min-[1100px]:text-sm ${
                        isSelected
                          ? "bg-primary-4 dark:bg-primary-3 text-primary-3 dark:text-white font-semibold"
                          : "text-foreground/70 hover:bg-background dark:hover:bg-foreground/5 hover:text-foreground border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-[1100px]:gap-2.5 min-w-0">
                        <div
                          className="w-2 h-3 min-[1100px]:w-2.5 min-[1100px]:h-4 rounded-xs shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-start truncate">{cat.name}</span>
                      </div>
                      {cat.products !== undefined && (
                        <span
                          className={`text-xs min-[1100px]:text-sm tabular-nums px-1.5 py-0.5 rounded-md shrink-0 ml-1.5 min-[1100px]:ml-2 transition-colors ${
                            isSelected
                              ? "bg-primary-3/20 text-primary-3 dark:bg-white/20 dark:text-white font-semibold"
                              : "text-foreground/40 group-hover:text-foreground/60"
                          }`}
                        >
                          {cat.products}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-2 min-[1100px]:gap-3 mb-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <AppSearchInput
                  placeholder={t("labels.products.search_placeholder")}
                  value={searchInput}
                  onChange={setSearchInput}
                  className="flex-1 w-full min-w-0 min-[1100px]:w-90 min-[1100px]:flex-initial"
                />
              </div>

              <div className="flex items-center gap-2 min-[1100px]:gap-3 shrink-0">
                {canEdit && rowsSelected.length > 0 && (
                  <AppButton
                    color="red"
                    onClick={onDeleteSelected}
                    className="flex items-center gap-1.5 w-10 min-w-10 px-0 min-[900px]:w-auto min-[900px]:min-w-0 min-[900px]:px-4 shrink-0"
                    title={`${t("labels.all.delete")} (${rowsSelected.length})`}
                    aria-label={`${t("labels.all.delete")} (${rowsSelected.length})`}
                  >
                    <DeleteOutlined style={{ fontSize: 18 }} />
                    <span className="hidden min-[900px]:inline">
                      {t("labels.all.delete")} ({rowsSelected.length})
                    </span>
                  </AppButton>
                )}

                <AppFilter
                  validKeys={VALID_FILTER_KEYS}
                  onChange={handleFilterChange}
                >
                  <ProductFilterFields />
                </AppFilter>

                {canEdit && (
                  <AppButton
                    color="primary"
                    onClick={() => {
                      setForm({
                        open: true,
                        item: {
                          category_id:
                            selectedCategoryId != null
                              ? String(selectedCategoryId)
                              : null,
                        },
                      });
                    }}
                    className="flex items-center gap-1.5 w-10 min-w-10 px-0 min-[900px]:w-auto min-[900px]:min-w-0 min-[900px]:px-4 shrink-0"
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
            </div>

            <AppGrid
              columns={columns}
              pagination={products}
              actions={canEdit ? actions : undefined}
              selectedRows={canEdit ? rowsSelected : undefined}
              onSelectedChange={canEdit ? setRowsSelected : undefined}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <AppModal
        isOpen={form.open}
        onClose={onCloseForm}
        title={
          form.item.id
            ? t("labels.products.form.edit_title")
            : t("labels.products.form.add_title")
        }
      >
        <AppProductForm
          onSaved={onSaveItem}
          product={form.item}
          onClose={onCloseForm}
        />
      </AppModal>
    </AppPage>
  );
}

function ProductFilterFields() {
  const { t } = useTranslation();
  const { control } = useFormContext();

  return (
    <>
      <Controller
        control={control}
        name="created_at"
        render={({ field }) => (
          <AppDateRange label={t("labels.products.created_at")} {...field} />
        )}
      />
      <Controller
        control={control}
        name="price"
        render={({ field }) => (
          <AppAmountRange label={t("labels.products.price")} {...field} />
        )}
      />
      <Controller
        control={control}
        name="stock_amount"
        render={({ field }) => (
          <AppNumberRange
            label={t("labels.products.stock_amount")}
            {...field}
          />
        )}
      />
    </>
  );
}
