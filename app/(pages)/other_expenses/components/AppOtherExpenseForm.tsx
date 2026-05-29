"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import AppInputText from "@/app/components/inputs/AppInputText";
import AppSelectPaginated from "@/app/components/inputs/AppSelectPaginated";
import AppDate from "@/app/components/inputs/AppDate";
import { currencyFormatter } from "@/app/utils/formatters/currency";
import AppButton from "@/app/components/AppButton";
import AppModal from "@/app/components/AppModal";
import { usePagination } from "@/app/utils/usePagination";
import { otherExpensesService } from "@/api/services/OtherExpenses";
import { useDialogStore } from "@/stores/dialogStore";
import { CategoryType } from "@/enums/CategoryType";
import { categoriesService } from "@/api/services/Categories";
import { Category } from "@/api/schemas/Category";
import { OtherExpenseForm } from "@/api/schemas/OtherExpense";

interface AppOtherExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  model?: OtherExpenseForm;
}

export default function AppOtherExpenseForm({
  isOpen,
  onClose,
  onSaved,
  model,
}: AppOtherExpenseFormProps) {
  const { openDialog } = useDialogStore();
  const categoriesPagination = usePagination<Category>(categoriesService, {
    type: CategoryType.OTHER_EXPENSE,
    page_size: 20,
  });

  const isEditing = !!model?.id;

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OtherExpenseForm>({
    defaultValues: {},
  });

  useEffect(() => {
    if (isOpen) {
      categoriesPagination.load({
        params: {
          page: 1,
          type: CategoryType.OTHER_EXPENSE,
          include_ids: model?.category_id ? [model.category_id] : undefined,
        },
      });

      reset({
        name: model?.name || "",
        description: model?.description || "",
        value: model?.value ?? 0,
        date: model?.date ? model.date : new Date().toISOString(),
        category_id: model?.category_id ?? undefined,
      });
    }
  }, [isOpen, model, reset]);

  async function onSubmit(data: OtherExpenseForm) {
    try {
      const payload = {
        name: data.name,
        description: data.description || undefined,
        value: Number(data.value),
        date: `${data.date}T00:00:00`,
        category_id: data.category_id,
      };

      if (isEditing) {
        await otherExpensesService.patch(model!.id!, payload);
      } else {
        await otherExpensesService.post(payload);
      }

      openDialog({
        variant: "success",
        message: isEditing
          ? "Despesa atualizada com sucesso!"
          : "Despesa criada com sucesso!",
      });

      reset();
      onSaved?.();
      onClose();
    } catch (error) {
      openDialog({
        variant: "error",
        message: isEditing
          ? "Ocorreu um erro ao atualizar a despesa. Tente novamente."
          : "Ocorreu um erro ao criar a despesa. Tente novamente.",
      });
    }
  }

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Despesa" : "Nova Despesa"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <AppInputText
          label="Nome"
          placeholder="Nome da despesa"
          {...register("name", { required: "O nome é obrigatório" })}
          error={errors.name?.message}
        />

        <Controller
          name="value"
          control={control}
          rules={{
            required: "O valor é obrigatório",
            min: { value: 0.01, message: "O valor deve ser maior que zero" },
          }}
          render={({ field }) => (
            <AppInputText
              label="Valor"
              placeholder="R$ 0,00"
              mask={currencyFormatter}
              {...field}
              error={errors.value?.message}
            />
          )}
        />

        <Controller
          name="date"
          control={control}
          rules={{ required: "A data é obrigatória" }}
          render={({ field }) => (
            <AppDate
              label="Data"
              {...field}
              error={errors.date?.message}
            />
          )}
        />

        <Controller
          name="category_id"
          control={control}
          rules={{ required: "A categoria é obrigatória" }}
          render={({ field }) => (
            <AppSelectPaginated
              label="Categoria"
              placeholder="Selecione uma categoria"
              pagination={categoriesPagination}
              search
              value={field.value}
              onChange={field.onChange}
              error={errors.category_id?.message}
            />
          )}
        />

        <AppInputText
          label="Descrição"
          placeholder="Descrição"
          {...register("description")}
          error={errors.description?.message}
        />

        <div className="flex justify-end gap-3 pt-2">
          <AppButton
            type="button"
            color="background"
            className="px-4"
            onClick={onClose}
          >
            Cancelar
          </AppButton>
          <AppButton
            type="submit"
            color="primary"
            className="px-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvando..." : "Salvar"}
          </AppButton>
        </div>
      </form>
    </AppModal>
  );
}
