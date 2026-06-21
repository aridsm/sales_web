"use client";

import React, { useEffect, useMemo, useState } from "react";
import AppGroup from "@/app/components/AppGroup";
import { formatDateTime } from "@/app/utils/formatters/date";
import AppPage from "../../components/AppPage";
import {
  usePagination,
  type PaginationService,
} from "../../utils/usePagination";
import { categoriesService } from "@/api/services/CategoryService";
import { productsService } from "@/api/services/ProductService";
import { CategoryType } from "@/enums/CategoryType";
import { useDialogStore } from "@/stores/dialogStore";
import AppFilter from "../../components/AppFilter";
import { Controller, useFormContext } from "react-hook-form";
import AppSelectPaginated from "../../components/inputs/AppSelectPaginated";
import { useSearchParams } from "next/navigation";
import AppProductForm, {
  type ProductFormValues,
} from "./components/AppProductForm";
import { Edit } from "@mui/icons-material";
import AppModal from "@/app/components/AppModal";
import AppGrid from "@/app/components/AppGrid";
import { useTranslation } from "@/app/utils/i18n";
import { Category } from "@/api/schemas/Category";
import { Product } from "@/api/schemas/Product";

export default function ProductsPage() {
  const { t } = useTranslation();
  const [rowsSelected, setRowsSelected] = useState<Product[]>([]);

  const [form, setForm] = useState({
    open: false,
    item: {} as ProductFormValues,
  });
  const { openDialog } = useDialogStore();
  const searchParams = useSearchParams();

  const categories = usePagination<Category>(
    categoriesService as unknown as PaginationService<Category>,
    { type: CategoryType.PRODUCT },
  );

  const categoriesForm = usePagination<Category>(
    categoriesService as unknown as PaginationService<Category>,
    { type: CategoryType.PRODUCT, page_size: 20 },
  );

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    categories.load({ params: { ...params, type: CategoryType.PRODUCT } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          const params = Object.fromEntries(searchParams.entries());
          await categories.load({
            params: { ...params, type: CategoryType.PRODUCT },
          });
          setRowsSelected([]);
        } catch (err: unknown) {
          const error = err as {
            response?: {
              data?: { detail?: { error?: string; name?: string[] } };
            };
          };
          openDialog({
            variant: "error",
            message: t(
              error.response?.data?.detail?.error
                ? `errors.products.${error.response.data.detail.error}`
                : "errors.all.generic",
              {
                name: error.response?.data?.detail?.name?.join(", "),
              },
            ),
          });
        }
      },
    });
  }

  async function onSaveItem() {
    await categories.load();
  }

  function onCloseForm() {
    setForm((prev) => ({
      ...prev,
      open: false,
    }));
  }

  return (
    <AppPage title={t("labels.products.title")}>
      <AppGroup
        groups={categories}
        selectedItems={rowsSelected}
        renderGroupName={(category) => (
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: category.color }}
            />
            <span className="mt-0.5">{category.name}</span>
            {!!category.products && (
              <span
                className={`rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold text-primary dark:text-white bg-primary/15 dark:bg-primary`}
              >
                {category.products}
              </span>
            )}
          </div>
        )}
        search={true}
        onDelete={onDeleteSelected}
        onNew={() => {
          setForm({
            open: true,
            item: { category_id: null },
          });
        }}
        onNewRow={({ group }) => {
          setForm({
            open: true,
            item: { category_id: group.id },
          });
        }}
        filter={
          <AppFilter pagination={categories}>
            <ProductFilterFields />
          </AppFilter>
        }
      >
        {({ group }) => (
          <AppProductsGrid
            group={group}
            setForm={setForm}
            rowsSelected={rowsSelected}
            setRowsSelected={setRowsSelected}
          />
        )}
      </AppGroup>

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
          categoriesPagination={categoriesForm}
          product={form.item}
          onClose={onCloseForm}
        />
      </AppModal>
    </AppPage>
  );
}

function AppProductsGrid({
  group,
  setForm,
  rowsSelected,
  setRowsSelected,
}: {
  group: Category;
  setForm: React.Dispatch<
    React.SetStateAction<{ open: boolean; item: ProductFormValues }>
  >;
  rowsSelected: Product[];
  setRowsSelected: React.Dispatch<React.SetStateAction<Product[]>>;
}) {
  const { t } = useTranslation();
  const products = usePagination<Product>(
    productsService as unknown as PaginationService<Product>,
    { category_id: group.id },
  );

  useEffect(() => {
    products.load();
  }, [group.products]);

  const columns = useMemo(
    () => [
      {
        column: t("labels.all.name"),
        cell: ({ row }: { row: Product }) => row.name,
        size: 300,
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
        size: 150,
      },
      {
        column: t("labels.products.stock_amount"),
        cell: ({ row }: { row: Product }) => <p>{row.stock_amount}</p>,
        size: 150,
      },
      {
        column: t("labels.products.sold_amount"),
        cell: ({ row }: { row: Product }) => <p>{row.sold_amount}</p>,
        size: 150,
      },
      {
        column: t("labels.products.created_at"),
        cell: ({ row }: { row: Product }) => formatDateTime(row.created_at),
        size: 200,
      },
      {
        column: "ID",
        cell: ({ row }: { row: Product }) => row.id,
        size: 400,
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

  return (
    <AppGrid
      columns={columns}
      pagination={products}
      actions={actions}
      selectedRows={rowsSelected}
      hideSelectionCount
      className="max-h-100"
      onSelectedChange={setRowsSelected}
    />
  );
}

function ProductFilterFields() {
  const { t } = useTranslation();
  const { control } = useFormContext();

  const categories = usePagination<Category>(
    categoriesService as unknown as PaginationService<Category>,
    { type: CategoryType.PRODUCT, page_size: 20 },
  );

  useEffect(() => {
    categories.load({ params: { page: 1 } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Controller
      control={control}
      name="id"
      render={({ field }) => (
        <AppSelectPaginated
          label={t("labels.products.category")}
          placeholder={t("labels.products.filter_category")}
          pagination={categories}
          search
          multiple
          value={field.value}
          onChange={field.onChange}
        />
      )}
    />
  );
}
