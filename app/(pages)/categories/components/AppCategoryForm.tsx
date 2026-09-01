"use client";
import { useEffect, useMemo } from "react";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AppModal from "../../../components/AppModal";
import AppInputText from "../../../components/inputs/AppInputText";
import AppButton from "@/app/components/AppButton";
import AppColor from "@/app/components/inputs/AppColor";
import { CategoryType } from "@/enums/CategoryType";
import { categoriesService } from "@/api/services/CategoryService";
import { useDialogStore } from "@/stores/dialogStore";
import { Category, CategoryForm, getApiError } from "@/api/schemas";
import { useTranslation } from "@/app/utils/i18n";

interface AppCategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  model?: Category;
  onSave: () => Promise<void>;
}

export default function AppCategoryForm({
  isOpen,
  onClose,
  model,
  onSave,
}: AppCategoryFormProps) {
  const { t } = useTranslation();
  const { openDialog } = useDialogStore();
  const categorySchema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .min(1, { message: t("labels.categories.form.name_required") }),
        type: z.number(),
        color: z.string(),
      }),
    [t],
  );

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
    } catch (err) {
      const { code, params } = getApiError(err);
      openDialog({
        variant: "error",
        message: t(
          code ? `errors.categories.${code}` : "errors.all.generic",
          params,
        ),
      });
    }
  }

  function handleClose() {
    reset();
    onClose();
  }

  const categoryTypeOptions = [
    {
      id: CategoryType.PRODUCT,
      name: t("labels.categories.types.product_singular"),
    },
    {
      id: CategoryType.OTHER_EXPENSE,
      name: t("labels.categories.types.other_expense"),
    },
  ];

  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        model
          ? t("labels.categories.form.edit_title")
          : t("labels.categories.form.add_title")
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <AppInputText
          label={t("labels.all.name")}
          type="text"
          placeholder={t("labels.categories.form.name_placeholder")}
          {...register("name")}
          error={errors.name?.message}
        />

        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <AppColor
              label={t("labels.categories.color")}
              placeholder={t("labels.categories.form.color_placeholder")}
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
            {t("labels.all.cancel")}
          </AppButton>
          <AppButton
            type="submit"
            disabled={!isValid}
            color="primary"
            className="px-4"
          >
            {t("labels.all.save")}
          </AppButton>
        </div>
      </form>
    </AppModal>
  );
}
