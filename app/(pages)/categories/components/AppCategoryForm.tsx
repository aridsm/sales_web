"use client";
import { useEffect } from "react";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AppModal from "../../../components/AppModal";
import AppInputText from "../../../components/inputs/AppInputText";
import AppButton from "@/app/components/AppButton";
import AppSelect from "@/app/components/inputs/AppSelect";
import AppColor from "@/app/components/inputs/AppColor";
import { CategoryType } from "@/enums/CategoryType";
import { categoriesService } from "@/api/services/Categories";
import { useDialogStore } from "@/stores/dialogStore";
import { CategoryForm } from "@/api/schemas/Category";
import { useTranslation } from "@/app/utils/i18n";

const categorySchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório" }),
  type: z.number(),
  color: z.string(),
});

interface AppCategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  model?: any;
  onSave: () => Promise<void>;
}

export default function AppCategoryForm({
  isOpen,
  onClose,
  model,
  onSave,
}: AppCategoryFormProps) {
  const { t: getLabel } = useTranslation();
  const { openDialog } = useDialogStore();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isValid },
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (isOpen) {
      if (model) {
        reset(model);
      } else {
        reset({
          name: "",
          type: undefined,
          color: "",
        });
      }
    }
  }, [isOpen, model, reset]);

  async function onSubmit(data: CategoryForm) {
    try {
      if (model?.id) {
        await categoriesService.patch(model.id, data);
      } else {
        await categoriesService.post(data);
      }
      await onSave();
      handleClose();
    } catch (error: any) {
      console.error(error);
      openDialog({
        variant: "error",
        message: getLabel(
          `errors.categories.${error.response.data.detail.error}`,
        ),
      });
    }
  }

  function handleClose() {
    reset();
    onClose();
  }

  const categoryTypeOptions = [
    { id: CategoryType.PRODUCT, name: "Produto" },
    { id: CategoryType.OTHER_EXPENSE, name: "Outras Despesas" },
  ];

  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      title={model ? "Editar Categoria" : "Adicionar Categoria"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <AppInputText
          label="Nome"
          type="text"
          placeholder="Nome da categoria"
          {...register("name")}
          error={errors.name?.message}
        />

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <AppSelect
              label="Tipo"
              placeholder="Selecione o tipo"
              options={categoryTypeOptions}
              value={field.value}
              onChange={field.onChange}
              error={errors.type?.message}
            />
          )}
        />

        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <AppColor
              label="Cor"
              placeholder="Selecione a cor"
              value={field.value}
              onChange={field.onChange}
              error={errors.color?.message}
            />
          )}
        />

        <div className="mt-2 flex justify-end gap-2">
          <AppButton
            type="button"
            onClick={handleClose}
            color="background"
            className="px-4"
          >
            Cancelar
          </AppButton>
          <AppButton
            type="submit"
            disabled={!isValid}
            color="primary"
            className="px-4"
          >
            Salvar
          </AppButton>
        </div>
      </form>
    </AppModal>
  );
}
