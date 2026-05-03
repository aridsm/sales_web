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
import { categoriesService } from "@/api/services/Categories";
import { CategoryType } from "@/enums/CategoryType";
import { ActionItem } from "../../components/AppActions";
import { Edit } from "@mui/icons-material";
import { Controller, useFormContext } from "react-hook-form";
import AppGridFilter from "../../components/AppGridFilter";
import AppSelect from "../../components/inputs/AppSelect";
import { useSearchParams } from "next/navigation";

interface Category {
  id: number;
  name: string;
  color?: string;
  type?: CategoryType;
}

export default function CategoriesPage() {
  const [rowsSelected, setRowsSelected] = useState<Category[]>([]);
  const [form, setForm] = useState({
    open: false,
    item: {} as Category | undefined
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
    [CategoryType.PRODUCT]: "Produtos",
    [CategoryType.OTHER_EXPENSE]: "Outras Despesas",
  };

  const columns = useMemo(
    () => [
      {
        column: "Nome",
        cell: ({ row }: { row: Category }) => row.name,
        size: 280,
      },

      {
        column: "Cor",
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
        column: "Tipo",
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
    [],
  );

  const actions: ActionItem<Category>[] = [
    {
      text: "Editar",
      preText: <Edit fontSize="small" />,
      click: (category) => {
        setForm({
          open: true,
          item: category
        });
      },
    },
  ];

  function handleNew() {
    setForm({
      open: true,
      item: undefined
    });
  };

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
          await categoriesService.bulkDelete(ids);
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
    <AppPage title="Categorias">
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
            <CategoryFilterFields />
          </AppGridFilter>
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
  const { control } = useFormContext();

  const categoryTypeOptions = [
    { id: CategoryType.PRODUCT, name: "Produto" },
    { id: CategoryType.OTHER_EXPENSE, name: "Outras Despesas" },
  ];

  return (
    <Controller
      name="type"
      control={control}
      render={({ field }) => (
        <AppSelect
          label="Tipo"
          placeholder="Filtrar por tipo"
          options={categoryTypeOptions}
          value={field.value}
          multiple
          onChange={field.onChange}
        />
      )}
    />
  );
}
