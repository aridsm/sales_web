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
import {
  Edit,
  AddOutlined,
  DeleteOutlined,
} from "@mui/icons-material";
import AppSearchInput from "../../components/inputs/AppSearchInput";
import AppButton from "../../components/AppButton";
import AppTabs from "../../components/AppTabs";
import { useSearchParams } from "next/navigation";
import { Category, getApiError } from "@/api/schemas";
import { useTranslation } from "@/app/utils/i18n";
import { usePermission } from "../../utils/usePermission";

export default function CategoriesPage() {
  const { t } = useTranslation();
  const { canEdit } = usePermission();
  const [rowsSelected, setRowsSelected] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<CategoryType>(
    CategoryType.PRODUCT,
  );
  const [form, setForm] = useState({
    open: false,
    item: {} as Category | undefined,
  });
  const [search, setSearch] = useState("");

  const pagination = usePagination<Category>(
    categoriesService as unknown as PaginationService<Category>,
    {},
  );

  const searchParams = useSearchParams();

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    pagination.load({ params: { ...params, type: activeTab } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

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
          <div className="flex items-center gap-2 whitespace-nowrap px-2">
            {row.color && (
              <div
                className="w-3 h-3 rounded-full shrink-0 border border-black/10 dark:border-white/10"
                style={{ backgroundColor: row.color }}
              />
            )}
            <span>{row.color || "-"}</span>
          </div>
        ),
      },

      {
        column: "ID",
        cell: ({ row }: { row: Category }) => (
          <span className="px-2" title={row.id}>
            {row.id}
          </span>
        ),
        size: 350,
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
      item: { type: activeTab } as Category,
    });
  }

  function onSave() {
    pagination.load();
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
        } catch (err) {
          const { code, params } = getApiError(err);
          openDialog({
            variant: "error",
            message: t(
              code ? `errors.categories.${code}` : "errors.all.generic",
              params,
            ),
          });
        }
      },
    });
  }

  return (
    <AppPage title={t("labels.categories.title")}>
      <AppTabs
        tabs={[
          {
            value: String(CategoryType.PRODUCT),
            label: t("labels.categories.types.product"),
          },
          {
            value: String(CategoryType.OTHER_EXPENSE),
            label: t("labels.categories.types.other_expense"),
          },
        ]}
        activeTab={String(activeTab)}
        onChange={(val) => {
          setActiveTab(Number(val) as CategoryType);
          setRowsSelected([]);
        }}
        className="mb-4"
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <AppSearchInput
          value={search}
          onChange={setSearch}
          onSearch={(val) => pagination.load({ params: { search: val, page: 1 } })}
          placeholder={t("labels.grid.search_placeholder")}
          className="w-full sm:w-90"
        />

        <div className="flex items-center gap-2">
          {rowsSelected.length > 0 && (
            <AppButton
              onClick={onDeleteSelected}
              color="red"
              className="px-4 py-2 shrink-0"
            >
              <DeleteOutlined fontSize="small" />
              {t("labels.all.delete")} ({rowsSelected.length})
            </AppButton>
          )}

          {canEdit && (
            <AppButton
              onClick={handleNew}
              color="primary"
              className="px-4 py-2 shrink-0"
            >
              <AddOutlined fontSize="small" />
              {t("labels.grid.add_item")}
            </AppButton>
          )}
        </div>
      </div>
      <AppGrid
        columns={columns}
        pagination={pagination}
        selectedRows={canEdit ? rowsSelected : undefined}
        onSelectedChange={canEdit ? (rows) => setRowsSelected(rows) : undefined}
        actions={canEdit ? actions : undefined}
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
