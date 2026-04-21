"use client";

import { useEffect, useMemo, useState } from "react";
import AppPage from "../../components/AppPage";
import AppGrid from "../../components/AppGrid";
import AppCategoryForm from "./components/AppCategoryForm";
import {
  usePagination,
  type PaginationService,
} from "../../utils/usePagination";
import { categoriesService } from "@/services/Categories";
import { CategoryType } from "@/enums/CategoryType";

interface Category {
  id: number;
  name: string;
  color?: string;
  type?: CategoryType;
}

export default function CategoriesPage() {
  const [rowsSelected, setRowsSelected] = useState<Category[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const pagination = usePagination<Category>(
    categoriesService as unknown as PaginationService<Category>,
    {},
  );

  useEffect(() => {
    pagination.load();
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

  return (
    <AppPage title="Categorias">
      <AppGrid
        columns={columns}
        pagination={pagination}
        onNew={() => setIsFormOpen(true)}
        onDeleteSelected={() => { }}
        selectedRows={rowsSelected}
        onSelectedChange={(rows) => setRowsSelected(rows)}
      />

      <AppCategoryForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </AppPage>
  );
}
