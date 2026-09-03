"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import AppInputText from "@/app/components/inputs/AppInputText";
import AppSelectPaginated from "@/app/components/inputs/AppSelectPaginated";
import { currencyFormatter } from "@/app/utils/formatters/currency";
import AppButton from "@/app/components/AppButton";
import { useDialogStore } from "@/stores/dialogStore";
import { CategoryType } from "@/enums/CategoryType";
import { useTranslation } from "@/app/utils/i18n";
import { usePagination, type PaginationService } from "@/app/utils/usePagination";
import { categoriesService } from "@/api/services/CategoryService";
import { productsService } from "@/api/services/ProductService";

import { Category, getApiError } from "@/api/schemas";

interface ProductFormData {
  name: string;
  category_id: string | null;
  price: number | string;
}

export interface ProductFormValues {
  id?: string | number;
  name?: string;
  category_id?: string | null;
  price?: number;
}

interface AppProductFormProps {
  onClose: () => void;
  onSaved?: () => void;
  product: ProductFormValues;
}

export default function AppProductForm({
  onClose,
  onSaved,
  product,
}: AppProductFormProps) {
  const { t } = useTranslation();
  const { openDialog } = useDialogStore();

  const isEditing = !!product?.id;

  const categoriesPagination = usePagination<Category>(
    categoriesService as unknown as PaginationService<Category>,
    { type: CategoryType.PRODUCT, page_size: 20 },
  );

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
    },
  });

  useEffect(() => {
    reset({
      name: product.name || "",
      category_id: product.category_id ?? null,
      price: product.price ?? "",
    });
  }, []);

  async function onSubmit(data: ProductFormData) {
    try {
      const payload = {
        name: data.name,
        category_id: data.category_id!,
        price: Number(data.price),
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
    } catch (err) {
      const { code, params } = getApiError(err);
      openDialog({
        variant: "error",
        message: t(
          code ? `errors.products.${code}` : "errors.all.generic",
          params,
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
