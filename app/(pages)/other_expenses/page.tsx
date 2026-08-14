"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import AppPage from "../../components/AppPage";
import AppGrid from "../../components/AppGrid";
import { useDialogStore } from "@/stores/dialogStore";
import {
  usePagination,
  type PaginationService,
} from "../../utils/usePagination";
import { otherExpensesService } from "@/api/services/OtherExpenseService";
import { categoriesService } from "@/api/services/CategoryService";
import { CategoryType } from "@/enums/CategoryType";
import { ActionItem } from "../../components/AppActions";
import { Edit } from "@mui/icons-material";

import AppOtherExpenseForm from "./components/AppOtherExpenseForm";
import AppFilter from "../../components/AppFilter";
import { Controller, useFormContext } from "react-hook-form";
import AppSelectPaginated from "../../components/inputs/AppSelectPaginated";
import { OtherExpense, OtherExpenseForm } from "@/api/schemas/OtherExpense";
import { Category } from "@/api/schemas/Category";
import { useTranslation } from "@/app/utils/i18n";
import AppDateRange from "../../components/inputs/AppDateRange";
import AppAmountRange from "../../components/inputs/AppAmountRange";

export default function OtherExpensesPage() {
  const { t: getLabel } = useTranslation();
  const [rowsSelected, setRowsSelected] = useState<OtherExpense[]>([]);
  const [form, setForm] = useState({
    open: false,
    item: undefined as OtherExpenseForm | undefined,
  });

  const [filterParams, setFilterParams] = useState<Record<string, unknown>>({});
  const handleFilterChange = useCallback((params: Record<string, unknown>) => setFilterParams(params), []);

  const pagination = usePagination<OtherExpense>(
    otherExpensesService as unknown as PaginationService<OtherExpense>,
    {},
  );

  useEffect(() => {
    pagination.load({ replace: true, params: filterParams });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterParams]);

  const columns = useMemo(
    () => [
      {
        column: getLabel("labels.all.name"),
        cell: ({ row }: { row: OtherExpense }) => row.name,
        size: 250,
      },
      {
        column: getLabel("labels.other_expenses.category"),
        cell: ({ row }: { row: OtherExpense }) => (
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-sm"
              style={{
                backgroundColor: row.category_color,
              }}
            ></div>
            {row.category_name}
          </div>
        ),
        size: 250,
      },
      {
        column: getLabel("labels.other_expenses.value"),
        cell: ({ row }: { row: OtherExpense }) =>
          new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(row.value),
        size: 150,
      },
      {
        column: getLabel("labels.other_expenses.date"),
        cell: ({ row }: { row: OtherExpense }) =>
          new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }).format(new Date(row.date)),
        size: 150,
      },
      {
        column: getLabel("labels.other_expenses.description"),
        cell: ({ row }: { row: OtherExpense }) => row.description || "-",
        size: 250,
      },
    ],
    [],
  );

  const actions: ActionItem<OtherExpense>[] = [
    {
      text: getLabel("labels.all.edit"),
      preText: <Edit fontSize="small" />,
      click: (expense) => {
        setForm({
          open: true,
          item: expense,
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
      title: getLabel("labels.other_expenses.delete_title"),
      message:
        rowsSelected.length === 1
          ? getLabel("labels.other_expenses.delete_single")
          : getLabel("labels.other_expenses.delete_multiple").replace(
              "{{count}}",
              rowsSelected.length.toString(),
            ),
      confirmLabel: getLabel("labels.all.delete"),
      onConfirm: async () => {
        try {
          const ids = rowsSelected.map((item) => item.id);
          await otherExpensesService.bulkDelete(ids);
          await pagination.load();
          setRowsSelected([]);
        } catch (err: unknown) {
          const error = err as {
            response?: { data?: { detail?: { error?: string } } };
          };
          openDialog({
            variant: "error",
            message: getLabel(
              error.response?.data?.detail?.error
                ? `errors.other_expenses.${error.response.data.detail.error}`
                : "errors.all.generic",
            ),
          });
        }
      },
    });
  }

  return (
    <AppPage title={getLabel("labels.other_expenses.title")}>
      <AppGrid
        columns={columns}
        pagination={pagination}
        onNew={handleNew}
        selectedRows={rowsSelected}
        onSelectedChange={(rows) => setRowsSelected(rows)}
        actions={actions}
        search
        filter={
          <AppFilter
            onChange={handleFilterChange}
            validKeys={["category_id", "date", "value"]}
          >
            <OtherExpensesFilterFields />
          </AppFilter>
        }
      />

      <AppOtherExpenseForm
        isOpen={form.open}
        onClose={() => setForm({ open: false, item: undefined })}
        model={form.item}
        onSaved={onSave}
      />
    </AppPage>
  );
}

function OtherExpensesFilterFields() {
  const { t: getLabel } = useTranslation();
  const { control } = useFormContext();

  const categories = usePagination<Category>(
    categoriesService as unknown as PaginationService<Category>,
    { type: CategoryType.OTHER_EXPENSE, page_size: 20 },
  );

  useEffect(() => {
    categories.load({ params: { page: 1 } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Controller
        control={control}
        name="category_id"
        render={({ field }) => (
          <AppSelectPaginated
            label={getLabel("labels.other_expenses.category")}
            placeholder={getLabel("labels.other_expenses.filter_category")}
            pagination={categories}
            search
            multiple
            clearable
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="date"
        render={({ field }) => (
          <AppDateRange
            label={getLabel("labels.other_expenses.date")}
            {...field}
          />
        )}
      />
      <Controller
        control={control}
        name="value"
        render={({ field }) => (
          <AppAmountRange
            label={getLabel("labels.other_expenses.value")}
            {...field}
          />
        )}
      />
    </>
  );
}
