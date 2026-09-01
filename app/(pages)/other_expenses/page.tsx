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
import {
  Edit,
  SearchOutlined,
  AddOutlined,
  DeleteOutlined,
} from "@mui/icons-material";
import AppInputText from "../../components/inputs/AppInputText";
import AppButton from "../../components/AppButton";

import AppOtherExpenseForm from "./components/AppOtherExpenseForm";
import AppFilter from "../../components/AppFilter";
import { Controller, useFormContext } from "react-hook-form";
import AppSelectPaginated from "../../components/inputs/AppSelectPaginated";
import { OtherExpense, OtherExpenseForm } from "@/api/schemas/OtherExpense";
import { Category } from "@/api/schemas/Category";
import { getApiError } from "@/api/schemas";
import { useTranslation } from "@/app/utils/i18n";
import AppDateRange from "../../components/inputs/AppDateRange";
import AppAmountRange from "../../components/inputs/AppAmountRange";

export default function OtherExpensesPage() {
  const { t: getLabel } = useTranslation();
  const [rowsSelected, setRowsSelected] = useState<OtherExpense[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    open: false,
    item: undefined as OtherExpenseForm | undefined,
  });

  const [filterParams, setFilterParams] = useState<Record<string, unknown>>({});
  const handleFilterChange = useCallback(
    (params: Record<string, unknown>) => setFilterParams(params),
    [],
  );

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
        } catch (err) {
          const { code, params } = getApiError(err);
          openDialog({
            variant: "error",
            message: getLabel(
              code ? `errors.other_expenses.${code}` : "errors.all.generic",
              params,
            ),
          });
        }
      },
    });
  }

  return (
    <AppPage title={getLabel("labels.other_expenses.title")}>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-3">
        <div className="relative w-full sm:max-w-sm">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-foreground z-10">
            <SearchOutlined fontSize="small" />
          </div>
          <AppInputText
            type="text"
            className="pl-10!"
            placeholder={getLabel("labels.grid.search_placeholder")}
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
        <div className="flex gap-3 w-full sm:w-auto ml-auto">
          {" "}
          {rowsSelected.length > 0 && (
            <AppButton
              onClick={onDeleteSelected}
              color="red"
              flat
              className="w-full sm:w-auto px-4 py-2 shrink-0"
            >
              <DeleteOutlined fontSize="small" />
              {getLabel("labels.all.delete")} ({rowsSelected.length})
            </AppButton>
          )}
          <AppFilter
            onChange={handleFilterChange}
            validKeys={["category_id", "date", "value"]}
          >
            <OtherExpensesFilterFields />
          </AppFilter>
          <AppButton
            onClick={handleNew}
            color="primary"
            className="w-full sm:w-auto px-4 py-2 shrink-0"
          >
            <AddOutlined fontSize="small" />
            {getLabel("labels.grid.add_item")}
          </AppButton>
        </div>
      </div>

      <AppGrid
        columns={columns}
        pagination={pagination}
        selectedRows={rowsSelected}
        onSelectedChange={(rows) => setRowsSelected(rows)}
        actions={actions}
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
