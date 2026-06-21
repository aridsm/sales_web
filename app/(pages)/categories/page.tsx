"use client";

import { useEffect, useMemo, useState } from "react";
import { useDialogStore } from "@/stores/dialogStore";
import AppPage from "../../components/AppPage";
import AppGrid from "../../components/AppGrid";
import AppCategoryForm from "./components/AppCategoryForm";
import {
  usePagination,
  type PaginationService,
} from "../../utils/usePagination";
import { categoriesService } from "@/api/services/CategoryService";
import { CategoryType } from "@/enums/CategoryType";
import { ActionItem } from "../../components/AppActions";
import { Edit } from "@mui/icons-material";
import { Controller, useFormContext } from "react-hook-form";
import AppFilter from "../../components/AppFilter";
import AppSelect from "../../components/inputs/AppSelect";
import { useSearchParams } from "next/navigation";
import { Category } from "@/api/schemas/Category";
import { useTranslation } from "@/app/utils/i18n";

export default function CategoriesPage() {
  const { t } = useTranslation();
  const [rowsSelected, setRowsSelected] = useState<Category[]>([]);
  const [form, setForm] = useState({
    open: false,
    item: {} as Category | undefined,
  });

  const pagination = usePagination<Category>(
    categoriesService as unknown as PaginationService<Category>,
    {},
  );

  const searchParams = useSearchParams();

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    pagination.load({ params });
  }, []);

  const CategoryTypes = {
    [CategoryType.PRODUCT]: t("labels.categories.types.product"),
    [CategoryType.OTHER_EXPENSE]: t("labels.categories.types.other_expense"),
  };

  const columns = useMemo(
    () => [
      {
        column: t("labels.all.name"),
        cell: ({ row }: { row: Category }) => row.name,
        size: 280,
      },

      {
        column: t("labels.categories.color"),
        size: 150,
        cell: ({ row }: { row: Category }) => (
          <div className="flex gap-2 items-center">
            <div
              className={`min-w-4 h-4 rounded-sm`}
              style={{ backgroundColor: row.color }}
            />
            <span>{row.color}</span>
          </div>
        ),
      },
      {
        column: t("labels.categories.type"),
        cell: ({ row }: { row: Category }) => (
          <p>{CategoryTypes[row.type as CategoryType]} </p>
        ),
        size: 200,
      },
      {
        column: "ID",
        cell: ({ row }: { row: Category }) => row.id,
        size: 400,
      },
    ],
    [t],
  );

  const actions: ActionItem<Category>[] = [
    {
      text: t("labels.all.edit"),
      preText: <Edit fontSize="small" />,
      click: (category) => {
        setForm({
          open: true,
          item: category,
        });
      },
    },
  ];

  function handleNew() {
    setForm({
      open: true,
      item: undefined,
    });
  }

  async function onSave() {
    await pagination.load();
  }

  const { openDialog } = useDialogStore();

  function onDeleteSelected() {
    openDialog({
      variant: "confirm",
      title: t("labels.categories.delete_title"),
      message:
        rowsSelected.length === 1
          ? t("labels.categories.delete_single")
          : t("labels.categories.delete_multiple", {
              count: rowsSelected.length,
            }),
      confirmLabel: t("labels.all.delete"),
      onConfirm: async () => {
        try {
          const ids = rowsSelected.map((item) => item.id);
          await categoriesService.bulkDelete(ids);
          await pagination.load();
          setRowsSelected([]);
        } catch (err: unknown) {
          const error = err as { response?: { data?: { detail?: { error?: string; name?: string[] } } } };
          openDialog({
            variant: "error",
            message: t(
              error.response?.data?.detail?.error ? `errors.categories.${error.response.data.detail.error}` : "errors.all.generic",
              {
                name: error.response?.data?.detail?.name?.join(", "),
              },
            ),
          });
        }
      },
    });
  }

  return (
    <AppPage title={t("labels.categories.title")}>
      <AppGrid
        columns={columns}
        pagination={pagination}
        onNew={handleNew}
        onDeleteSelected={onDeleteSelected}
        selectedRows={rowsSelected}
        onSelectedChange={(rows) => setRowsSelected(rows)}
        actions={actions}
        search
        filter={
          <AppFilter pagination={pagination}>
            <CategoryFilterFields />
          </AppFilter>
        }
      />

      <AppCategoryForm
        isOpen={form.open}
        onClose={() => setForm({ open: false, item: undefined })}
        model={form.item}
        onSave={onSave}
      />
    </AppPage>
  );
}

function CategoryFilterFields() {
  const { t } = useTranslation();
  const { control } = useFormContext();

  const categoryTypeOptions = [
    {
      id: CategoryType.PRODUCT,
      name: t("labels.categories.types.product_singular"),
    },
    {
      id: CategoryType.OTHER_EXPENSE,
      name: t("labels.categories.types.other_expense"),
    },
  ];

  return (
    <Controller
      name="type"
      control={control}
      render={({ field }) => (
        <AppSelect
          label={t("labels.categories.type")}
          placeholder={t("labels.categories.filter_type")}
          options={categoryTypeOptions}
          value={field.value}
          multiple
          onChange={field.onChange}
        />
      )}
    />
  );
}
