"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { FilterList, DeleteSweepOutlined } from "@mui/icons-material";
import AppModal from "./AppModal";
import AppButton from "./AppButton";
import { PaginationResult } from "../utils/usePagination";
import { useTranslation } from "@/app/utils/i18n";

interface AppFilterProps<T = unknown> {
  pagination: PaginationResult<T>;
  children: React.ReactNode;
  title?: string;
  excludeKeys?: string[];
  validKeys?: string[];
}

const getParamsFromUrl = (params: URLSearchParams) => {
  const obj: Record<string, unknown> = {};
  const keys = Array.from(new Set(params.keys()));
  keys.forEach((key) => {
    const values = params.getAll(key).map((v) => {
      const num = Number(v);
      return !isNaN(num) && v.trim() !== "" ? num : v;
    });
    const val = values.length > 1 ? values : values[0];

    if (key.startsWith("start_")) {
      const baseKey = key.replace("start_", "");
      if (!obj[baseKey]) obj[baseKey] = {};
      (obj[baseKey] as Record<string, unknown>).start = val;
    } else if (key.startsWith("end_")) {
      const baseKey = key.replace("end_", "");
      if (!obj[baseKey]) obj[baseKey] = {};
      (obj[baseKey] as Record<string, unknown>).end = val;
    } else {
      obj[key] = val;
    }
  });
  return obj;
};

export default function AppFilter<T = unknown>({
  pagination,
  children,
  title,
  excludeKeys = ["page", "page_size", "search"],
  validKeys,
}: AppFilterProps<T>) {
  const { t } = useTranslation();
  const modalTitle = title || t("labels.filter.title");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const methods = useForm();
  const { reset, handleSubmit } = methods;

  useEffect(() => {
    const params = getParamsFromUrl(searchParams);
    if (validKeys) {
      const filteredParams: Record<string, unknown> = {};
      validKeys.forEach((key) => {
        filteredParams[key] = params[key] !== undefined ? params[key] : undefined;
      });
      reset(filteredParams);
    } else {
      reset(params);
    }
  }, [reset, searchParams, validKeys]);

  function handleOpen() {
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
  }

  const onSubmit = (data: Record<string, unknown>) => {
    const newParams = new URLSearchParams(searchParams.toString());

    Object.entries(data).forEach(([key, value]) => {
      newParams.delete(key);
      newParams.delete(`start_${key}`);
      newParams.delete(`end_${key}`);

      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (v !== undefined && v !== null && v !== "") {
            newParams.append(key, String(v));
          }
        });
      } else if (typeof value === "object" && value !== null) {
        const range = value as Record<string, unknown>;
        if (
          range.start !== undefined &&
          range.start !== null &&
          range.start !== ""
        ) {
          newParams.set(`start_${key}`, String(range.start));
        }
        if (range.end !== undefined && range.end !== null && range.end !== "") {
          newParams.set(`end_${key}`, String(range.end));
        }
      } else if (value !== undefined && value !== null && value !== "") {
        newParams.set(key, String(value));
      }
    });

    newParams.set("page", "1");

    const flatParams: Record<string, unknown> = {};
    Array.from(new Set(newParams.keys())).forEach((key) => {
      const values = newParams.getAll(key);
      flatParams[key] = values.length > 1 ? values : values[0];
    });

    router.push(`${pathname}?${newParams.toString()}`);
    pagination.load({ params: flatParams, replace: true });
    handleClose();
  };

  function handleClear() {
    const emptyValues: Record<string, unknown> = {};
    if (validKeys) {
      validKeys.forEach((key) => {
        emptyValues[key] = undefined;
      });
    } else {
      const currentValues = methods.getValues();
      Object.keys(currentValues).forEach((key) => {
        emptyValues[key] = undefined;
      });
    }
    reset(emptyValues);
    router.push(pathname);
    pagination.load({ params: { page: 1 }, replace: true });
    handleClose();
  }

  const hasActiveFilters = validKeys
    ? validKeys.some(
        (key) =>
          searchParams.has(key) ||
          searchParams.has(`start_${key}`) ||
          searchParams.has(`end_${key}`),
      )
    : Object.keys(getParamsFromUrl(searchParams)).some(
        (key) => !excludeKeys.includes(key),
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
