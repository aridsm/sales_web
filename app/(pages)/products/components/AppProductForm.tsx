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
import { useTranslation } from "@/app/utils/i18n";

import { Category } from "@/api/schemas/Category";

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
}

interface AppProductFormProps {
  onClose: () => void;
  onSaved?: () => void;
  categoriesPagination: PaginationResult<Category>;
  product: ProductFormValues;
}

export default function AppProductForm({
  onClose,
  onSaved,
  categoriesPagination,
  product,
}: AppProductFormProps) {
  const { t } = useTranslation();
  const { openDialog } = useDialogStore();

  const isEditing = !!product?.id;

  useEffect(() => {
    categoriesPagination.load({
      params: {
        page: 1,
        type: CategoryType.PRODUCT,
        include_ids: product.category_id ? [product.category_id] : undefined,
      },
    });
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
        category_id: data.category_id!,
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
          ? t("labels.products.form.updated_success")
          : t("labels.products.form.created_success"),
      });

      reset();
      onSaved?.();
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: { error?: string; name?: string } } } };
      openDialog({
        variant: "error",
        message: t(
          error.response?.data?.detail?.error ? `errors.products.${error.response.data.detail.error}` : "errors.all.generic",
          {
            name: error.response?.data?.detail?.name,
          },
        ),
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <AppInputText
        label={t("labels.all.name")}
        placeholder={t("labels.products.form.name_placeholder")}
        {...register("name", { required: t("labels.products.form.name_required") })}
        error={errors.name?.message}
      />

      <Controller
        name="category_id"
        control={control}
        rules={{ required: t("labels.products.form.category_required") }}
        render={({ field }) => (
          <AppSelectPaginated
            label={t("labels.products.category")}
            placeholder={t("labels.products.form.category_placeholder")}
            pagination={categoriesPagination}
            search
            value={field.value ?? undefined}
            onChange={field.onChange}
            error={errors.category_id?.message}
          />
        )}
      />

      <Controller
        name="price"
        control={control}
        rules={{
          required: t("labels.products.form.price_required"),
          min: { value: 0, message: t("labels.products.form.price_positive") },
        }}
        render={({ field }) => (
          <AppInputText
            label={t("labels.products.price")}
            placeholder="R$ 0,00"
            mask={currencyFormatter}
            {...field}
            error={errors.price?.message}
          />
        )}
      />

      <AppInputText
        label={t("labels.products.stock_amount")}
        type="number"
        placeholder="0"
        min="0"
        step="1"
        {...register("stock_amount", {
          required: t("labels.products.form.stock_required"),
          min: { value: 0, message: t("labels.products.form.stock_positive") },
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
          {t("labels.all.cancel")}
        </AppButton>
        <AppButton
          type="submit"
          color="primary"
          className="px-4"
          disabled={isSubmitting}
        >
          {isSubmitting ? t("labels.all.saving") : t("labels.all.save")}
        </AppButton>
      </div>
    </form>
  );
}
