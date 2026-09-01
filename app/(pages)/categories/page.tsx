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
  SearchOutlined,
  AddOutlined,
  DeleteOutlined,
} from "@mui/icons-material";
import AppInputText from "../../components/inputs/AppInputText";
import AppButton from "../../components/AppButton";
import AppTabs from "../../components/AppTabs";
import { useSearchParams } from "next/navigation";
import { Category, getApiError } from "@/api/schemas";
import { useTranslation } from "@/app/utils/i18n";

export default function CategoriesPage() {
  const { t } = useTranslation();
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
          <div className="flex items-center gap-2 whitespace-nowrap">
            {row.color && (
              <div
                className="w-3 h-3 rounded-full shrink-0 border border-black/10 dark:border-white/10"
                style={{ backgroundColor: row.color }}
              />
            )}
            <span className="px-2 py-0.5 rounded-full bg-background-3 border border-border text-xs font-medium">
              {row.color || "-"}
            </span>
          </div>
        ),
      },

      {
        column: "ID",
        cell: ({ row }: { row: Category }) => (
          <span
            className="font-mono text-xs bg-background-2 dark:bg-background-3 px-2 py-1 rounded-md max-w-full truncate inline-block border border-border"
            title={row.id}
          >
            {row.id}
          </span>
        ),
        size: 300,
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
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-3">
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
        />

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
          {rowsSelected.length > 0 && (
            <AppButton
              onClick={onDeleteSelected}
              flat
              color="red"
              className="w-full sm:w-auto px-4 py-2 shrink-0"
            >
              <DeleteOutlined fontSize="small" />
              {t("labels.all.delete")} ({rowsSelected.length})
            </AppButton>
          )}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-foreground z-10">
              <SearchOutlined fontSize="small" />
            </div>
            <AppInputText
              type="text"
              className="pl-10!"
              placeholder={t("labels.grid.search_placeholder")}
              value={search}
              onChange={(e: any) => setSearch(e.target.value as string)}
              onBlur={() => pagination.load({ params: { search, page: 1 } })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  pagination.load({ params: { search, page: 1 } });
                }
              }}
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <AppButton
              onClick={handleNew}
              color="primary"
              className="w-full sm:w-auto px-4 py-2 shrink-0"
            >
              <AddOutlined fontSize="small" />
              {t("labels.grid.add_item")}
            </AppButton>
          </div>
        </div>
      </div>
      <AppGrid
        columns={columns}
        pagination={pagination}
        selectedRows={rowsSelected}
        onSelectedChange={(rows) => setRowsSelected(rows)}
        actions={actions}
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
