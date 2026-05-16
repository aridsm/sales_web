"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import AppInputText from "@/app/components/inputs/AppInputText";
import AppSelectPaginated from "@/app/components/inputs/AppSelectPaginated";
import { currencyFormatter } from "@/app/utils/formatters/currency";
import AppButton from "@/app/components/AppButton";
import { PaginationResult } from "@/app/utils/usePagination";
import { productsService } from "@/api/services/ProductService";
import { useDialogStore } from "@/stores/dialogStore";
import { CategoryType } from "@/enums/CategoryType";

interface ProductFormData {
  name: string;
  category_id: string | null;
  price: number | string;
  stock_amount: number | string;
}

export interface ProductFormValues {
  id?: string | number;
  name?: string;
  category_id?: string | null;
  price?: number;
  stock_amount?: number;
  [key: string]: any
}

interface AppProductFormProps {
  onClose: () => void;
  onSaved?: () => void;
  categoriesPagination: PaginationResult<any>;
  product: ProductFormValues
}

export default function AppProductForm({
  onClose,
  onSaved,
  categoriesPagination,
  product,
}: AppProductFormProps) {
  const { openDialog } = useDialogStore();

  const isEditing = !!product?.id;


  useEffect(() => {
    categoriesPagination.load({ params: { page: 1, type: CategoryType.PRODUCT, include_ids: product.category_id ? [product.category_id] : undefined } })
  }, []);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      category_id: null,
      price: "",
      stock_amount: "",
    },
  });

  useEffect(() => {
    reset({
      name: product.name || "",
      category_id: product.category_id ?? null,
      price: product.price ?? "",
      stock_amount: product.stock_amount ?? "",
    });
  }, []);

  async function onSubmit(data: ProductFormData) {
    try {
      const payload = {
        name: data.name,
        category_id: data.category_id,
        price: Number(data.price),
        stock_amount: Number(data.stock_amount),
      };

      if (isEditing) {
        await productsService.patch(product!.id!, payload);
      } else {
        await productsService.post(payload);
      }

      openDialog({
        variant: "success",
        message: isEditing
          ? "Produto atualizado com sucesso!"
          : "Produto criado com sucesso!",
      });

      reset();
      onSaved?.();
      onClose();
    } catch (error) {
      openDialog({
        variant: "error",
        message: isEditing
          ? "Ocorreu um erro ao atualizar o produto. Tente novamente."
          : "Ocorreu um erro ao criar o produto. Tente novamente.",
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <AppInputText
        label="Nome"
        placeholder="Nome do produto"
        {...register("name", { required: "O nome é obrigatório" })}
        error={errors.name?.message}
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

      <Controller
        name="price"
        control={control}
        rules={{
          required: "O preço é obrigatório",
          min: { value: 0, message: "O preço deve ser positivo" },
        }}
        render={({ field }) => (
          <AppInputText
            label="Preço"
            placeholder="R$ 0,00"
            mask={currencyFormatter}
            {...field}
            error={errors.price?.message}
          />
        )}
      />

      <AppInputText
        label="Quantidade em estoque"
        type="number"
        placeholder="0"
        min="0"
        step="1"
        {...register("stock_amount", {
          required: "A quantidade é obrigatória",
          min: { value: 0, message: "A quantidade deve ser positiva" },
        })}
        error={errors.stock_amount?.message}
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
  );
}
