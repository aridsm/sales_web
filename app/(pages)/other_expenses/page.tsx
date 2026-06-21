"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useSearchParams } from "next/navigation";
import AppOtherExpenseForm from "./components/AppOtherExpenseForm";
import AppFilter from "../../components/AppFilter";
import { Controller, useFormContext } from "react-hook-form";
import AppSelectPaginated from "../../components/inputs/AppSelectPaginated";
import { OtherExpense, OtherExpenseForm } from "@/api/schemas/OtherExpense";
import { useTranslation } from "@/app/utils/i18n";

export default function OtherExpensesPage() {
  const { t: getLabel } = useTranslation();
  const [rowsSelected, setRowsSelected] = useState<OtherExpense[]>([]);
  const [form, setForm] = useState({
    open: false,
    item: undefined as OtherExpenseForm | undefined,
  });

  const pagination = usePagination<OtherExpense>(
    otherExpensesService as unknown as PaginationService<OtherExpense>,
    {},
  );

  const searchParams = useSearchParams();

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    pagination.load({ params });
  }, []);

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
        onDeleteSelected={onDeleteSelected}
        selectedRows={rowsSelected}
        onSelectedChange={(rows) => setRowsSelected(rows)}
        actions={actions}
        search
        filter={
          <AppFilter pagination={pagination}>
            <OtherExpenseFilterFields />
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

function OtherExpenseFilterFields() {
  const { control } = useFormContext();
  const { t: getLabel } = useTranslation();

  const categories = usePagination<any>(
    categoriesService as unknown as PaginationService<any>,
    { type: CategoryType.OTHER_EXPENSE, page_size: 20 },
  );

  useEffect(() => {
    categories.load({ params: { page: 1 } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
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
          value={field.value}
          onChange={field.onChange}
        />
      )}
    />
  );
}
