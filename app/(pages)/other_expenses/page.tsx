"use client";

import { useEffect, useMemo, useState } from "react";
import AppPage from "../../components/AppPage";
import AppGrid from "../../components/AppGrid";
import { useDialogStore } from "@/stores/dialogStore";
import {
  usePagination,
  type PaginationService,
} from "../../utils/usePagination";
import { otherExpensesService } from "@/api/services/OtherExpenses";
import { categoriesService } from "@/api/services/Categories";
import { CategoryType } from "@/enums/CategoryType";
import { ActionItem } from "../../components/AppActions";
import { Edit } from "@mui/icons-material";
import { useSearchParams } from "next/navigation";
import AppOtherExpenseForm from "./components/AppOtherExpenseForm";
import AppGridFilter from "../../components/AppGridFilter";
import { Controller, useFormContext } from "react-hook-form";
import AppSelectPaginated from "../../components/inputs/AppSelectPaginated";
import { OtherExpense, OtherExpenseForm } from "@/api/schemas/OtherExpense";


export default function OtherExpensesPage() {
  const [rowsSelected, setRowsSelected] = useState<OtherExpense[]>([]);
  const [form, setForm] = useState({
    open: false,
    item: undefined as OtherExpenseForm | undefined,
  });

  const pagination = usePagination<OtherExpense>(
    otherExpensesService as unknown as PaginationService<OtherExpense>,
    {},
  );

  const categoriesFormPagination = usePagination<any>(
    categoriesService as unknown as PaginationService<any>,
    { type: CategoryType.OTHER_EXPENSE, page_size: 20 },
  );

  const searchParams = useSearchParams();

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    pagination.load({ params });
  }, []);

  const columns = useMemo(
    () => [
      {
        column: "Nome",
        cell: ({ row }: { row: OtherExpense }) => row.name,
        size: 250,
      },
      {
        column: "Categoria",
        cell: ({ row }: { row: OtherExpense }) => <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-sm"
            style={{
              backgroundColor: row.category_color,
            }}
          ></div>
          {row.category_name}
        </div>,
        size: 250,
      },
      {
        column: "Valor",
        cell: ({ row }: { row: OtherExpense }) => (
          new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(row.value)
        ),
        size: 150,
      },
      {
        column: "Data",
        cell: ({ row }: { row: OtherExpense }) => (
          new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }).format(new Date(row.date))
        ),
        size: 150,
      },
      {
        column: "Descrição",
        cell: ({ row }: { row: OtherExpense }) => row.description || "-",
        size: 250,
      },
    ],
    [],
  );

  const actions: ActionItem<OtherExpense>[] = [
    {
      text: "Editar",
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
      title: "Excluir itens",
      message: `Tem certeza que deseja excluir ${rowsSelected.length === 1 ? "o item selecionado" : `os ${rowsSelected.length} itens selecionados`}? Esta ação não pode ser desfeita.`,
      confirmLabel: "Excluir",
      onConfirm: async () => {
        try {
          const ids = rowsSelected.map((item) => item.id);
          await otherExpensesService.bulkDelete(ids);
          await pagination.load();
          setRowsSelected([]);
        } catch (error) {
          console.error(error);
          openDialog({
            variant: "error",
            message: "Ocorreu um erro ao excluir os itens. Tente novamente.",
          });
        }
      },
    });
  }

  return (
    <AppPage title="Outras Despesas">
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
          <AppGridFilter pagination={pagination}>
            <OtherExpenseFilterFields />
          </AppGridFilter>
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
          label="Categoria"
          placeholder="Filtrar por categoria"
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
