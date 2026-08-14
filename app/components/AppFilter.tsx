"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { FilterList, DeleteSweepOutlined } from "@mui/icons-material";
import AppModal from "./AppModal";
import AppButton from "./AppButton";
import { useTranslation } from "@/app/utils/i18n";

/**
 * Reads only the allowed keys from the URL search params and returns a flat
 * object ready to be sent to the API. Range keys (start_X / end_X) are kept
 * flat as individual params.
 *
 * @param searchParams - The URLSearchParams to read from.
 * @param validKeys    - The filter field names allowed (e.g. "price", "product_created_at").
 *                       Both "start_<key>" and "end_<key>" variants are automatically included.
 */
function readFilterParamsFromUrl(
  searchParams: URLSearchParams,
  validKeys: string[],
): Record<string, unknown> {
  const allowed = new Set<string>();
  validKeys.forEach((key) => {
    allowed.add(key);
    allowed.add(`start_${key}`);
    allowed.add(`end_${key}`);
  });

  const params: Record<string, unknown> = {};
  searchParams.forEach((value, key) => {
    if (!allowed.has(key) || !value) return;
    const existing = params[key];
    if (existing !== undefined) {
      // multi-value key (e.g. array selects)
      params[key] = Array.isArray(existing)
        ? [...existing, value]
        : [existing, value];
    } else {
      const num = Number(value);
      params[key] = !isNaN(num) && value.trim() !== "" ? num : value;
    }
  });
  return params;
}

/**
 * Converts flat API params back to the form shape expected by the field
 * components. Range keys like "start_price" / "end_price" are merged back
 * into { price: { start, end } }.
 */
function flatParamsToFormValues(
  flatParams: Record<string, unknown>,
  validKeys: string[],
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  validKeys.forEach((key) => {
    const start = flatParams[`start_${key}`];
    const end = flatParams[`end_${key}`];
    const direct = flatParams[key];

    if (start !== undefined || end !== undefined) {
      result[key] = { start: start ?? null, end: end ?? null };
    } else {
      result[key] = direct !== undefined ? direct : null;
    }
  });

  return result;
}

/**
 * Converts form values back to flat API params.
 * { price: { start: 10, end: 200 } } → { start_price: "10", end_price: "200" }
 */
function formValuesToFlatParams(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const flat: Record<string, unknown> = {};

  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      const nonEmpty = value.filter(
        (v) => v !== undefined && v !== null && v !== "",
      );
      if (nonEmpty.length > 0) flat[key] = nonEmpty;
    } else if (typeof value === "object" && value !== null) {
      const range = value as Record<string, unknown>;
      if (range.start !== undefined && range.start !== null && range.start !== "")
        flat[`start_${key}`] = range.start;
      if (range.end !== undefined && range.end !== null && range.end !== "")
        flat[`end_${key}`] = range.end;
    } else if (value !== undefined && value !== null && value !== "") {
      flat[key] = value;
    }
  });

  return flat;
}

interface AppFilterProps {
  children: React.ReactNode;
  /** Field names this filter manages (e.g. ["price", "product_created_at"]). */
  validKeys: string[];
  /** Called on mount and whenever the user applies or clears the filter. */
  onChange: (params: Record<string, unknown>) => void;
  title?: string;
}

export default function AppFilter({
  children,
  validKeys,
  onChange,
  title,
}: AppFilterProps) {
  const { t } = useTranslation();
  const modalTitle = title || t("labels.filter.title");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const methods = useForm();
  const { reset, handleSubmit } = methods;

  // Stable ref so the mount effect doesn't need onChange in its deps.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // On mount: read URL, populate form and fire initial onChange.
  useEffect(() => {
    const flatParams = readFilterParamsFromUrl(searchParams, validKeys);
    const formValues = flatParamsToFormValues(flatParams, validKeys);
    reset(formValues);
    onChangeRef.current(flatParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleOpen() {
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
  }

  const onSubmit = (data: Record<string, unknown>) => {
    const flatParams = formValuesToFlatParams(data);

    // Sync to URL (preserve non-filter params like page/search).
    const newParams = new URLSearchParams(searchParams.toString());
    validKeys.forEach((key) => {
      newParams.delete(key);
      newParams.delete(`start_${key}`);
      newParams.delete(`end_${key}`);
    });
    Object.entries(flatParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => newParams.append(key, String(v)));
      } else {
        newParams.set(key, String(value));
      }
    });
    newParams.set("page", "1");

    router.push(`${pathname}?${newParams.toString()}`);
    onChange(flatParams);
    handleClose();
  };

  function handleClear() {
    // Clear form fields.
    const emptyValues: Record<string, unknown> = {};
    validKeys.forEach((key) => {
      emptyValues[key] = null;
    });
    reset(emptyValues);

    // Clear URL params belonging to this filter.
    const newParams = new URLSearchParams(searchParams.toString());
    validKeys.forEach((key) => {
      newParams.delete(key);
      newParams.delete(`start_${key}`);
      newParams.delete(`end_${key}`);
    });
    newParams.set("page", "1");
    router.push(`${pathname}?${newParams.toString()}`);

    onChange({});
    handleClose();
  }

  const hasActiveFilters = validKeys.some(
    (key) =>
      searchParams.has(key) ||
      searchParams.has(`start_${key}`) ||
      searchParams.has(`end_${key}`),
  );

  return (
    <>
      <AppButton
        color="background"
        onClick={handleOpen}
        className={`px-4 shrink-0 relative ${hasActiveFilters ? "text-primary-3 dark:text-primary border-primary-3 hover:border-primary-3 dark:border-primary/60" : ""}`}
      >
        <FilterList fontSize="small" />
        {t("labels.filter.button")}
        {hasActiveFilters && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary-3 dark:bg-primary rounded-full border-2 border-background" />
        )}
      </AppButton>

      <AppModal isOpen={isOpen} onClose={handleClose} title={modalTitle}>
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 gap-4">{children}</div>

            <div className="flex justify-between gap-2 ">
              <AppButton
                type="button"
                onClick={handleClear}
                color="background"
                className="px-4"
              >
                <DeleteSweepOutlined fontSize="small" />
                {t("labels.filter.clear")}
              </AppButton>

              <AppButton type="submit" color="primary" className="px-6">
                {t("labels.filter.apply")}
              </AppButton>
            </div>
          </form>
        </FormProvider>
      </AppModal>
    </>
  );
}
