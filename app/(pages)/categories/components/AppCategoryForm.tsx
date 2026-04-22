"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AppModal from "../../../components/AppModal";
import AppInputText from "../../../components/inputs/AppInputText";
import AppButton from "@/app/components/AppButton";
import AppSelect from "@/app/components/inputs/AppSelect";
import { CategoryType } from "@/enums/CategoryType";

const categorySchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório" }),
  type: z.number({ error: "O tipo é obrigatório" }).min(1, { message: "O tipo é obrigatório" }),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface AppCategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppCategoryForm({ isOpen, onClose }: AppCategoryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isValid },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    mode: "onChange",
  });

  const onSubmit = (data: CategoryFormData) => {
    console.log("Form data:", data);
    handleClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const categoryTypeOptions = [
    { id: CategoryType.PRODUCT, name: "Produto" },
    { id: CategoryType.OTHER_EXPENSE, name: "Outras Despesas" },
  ];

  return (
    <AppModal isOpen={isOpen} onClose={handleClose} title="Adicionar Categoria">
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
              multiple
              onChange={field.onChange}
              error={errors.type?.message}
            />
          )}
        />

        <div className="mt-4 flex justify-end gap-2">
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
