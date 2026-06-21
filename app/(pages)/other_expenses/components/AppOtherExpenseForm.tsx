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
import { otherExpensesService } from "@/api/services/OtherExpenseService";
import { useDialogStore } from "@/stores/dialogStore";
import { CategoryType } from "@/enums/CategoryType";
import { categoriesService } from "@/api/services/CategoryService";
import { Category } from "@/api/schemas/Category";
import { OtherExpenseForm } from "@/api/schemas/OtherExpense";
import { useTranslation } from "@/app/utils/i18n";

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
  const { t: getLabel } = useTranslation();
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
          ? getLabel("labels.other_expenses.form.updated_success")
          : getLabel("labels.other_expenses.form.created_success"),
      });

      reset();
      onSaved?.();
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: { error?: string } } } };
      openDialog({
        variant: "error",
        message: getLabel(
          error.response?.data?.detail?.error ? `errors.other_expenses.${error.response.data.detail.error}` : "errors.all.generic"
        ),
      });
    }
  }

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? getLabel("labels.other_expenses.form.edit_title") : getLabel("labels.other_expenses.form.add_title")}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <AppInputText
          label={getLabel("labels.all.name")}
          placeholder={getLabel("labels.other_expenses.form.name_placeholder")}
          {...register("name", { required: getLabel("labels.other_expenses.form.name_required") })}
          error={errors.name?.message}
        />

        <Controller
          name="value"
          control={control}
          rules={{
            required: getLabel("labels.other_expenses.form.value_required"),
            min: { value: 0.01, message: "O valor deve ser maior que zero" },
          }}
          render={({ field }) => (
            <AppInputText
              label={getLabel("labels.other_expenses.value")}
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
          rules={{ required: getLabel("labels.other_expenses.form.date_required") }}
          render={({ field }) => (
            <AppDate label={getLabel("labels.other_expenses.date")} {...field} error={errors.date?.message} />
          )}
        />

        <Controller
          name="category_id"
          control={control}
          rules={{ required: getLabel("labels.other_expenses.form.category_required") }}
          render={({ field }) => (
            <AppSelectPaginated
              label={getLabel("labels.other_expenses.category")}
              placeholder={getLabel("labels.other_expenses.form.category_placeholder")}
              pagination={categoriesPagination}
              search
              value={field.value ?? undefined}
              onChange={field.onChange}
              error={errors.category_id?.message}
            />
          )}
        />

        <AppInputText
          label={getLabel("labels.other_expenses.description")}
          placeholder={getLabel("labels.other_expenses.form.description_placeholder")}
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
            {getLabel("labels.all.cancel")}
          </AppButton>
          <AppButton
            type="submit"
            color="primary"
            className="px-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? getLabel("labels.all.saving") : getLabel("labels.all.save")}
          </AppButton>
        </div>
      </form>
    </AppModal>
  );
}
