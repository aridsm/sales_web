"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { FilterList, DeleteSweepOutlined } from "@mui/icons-material";
import AppModal from "./AppModal";
import AppButton from "./AppButton";
import { PaginationResult } from "../utils/usePagination";

interface AppFilterProps {
  pagination: PaginationResult<any>;
  children: React.ReactNode;
  title?: string;
}

const getParamsFromUrl = (params: URLSearchParams) => {
  const obj: Record<string, any> = {};
  const keys = Array.from(new Set(params.keys()));
  keys.forEach((key) => {
    const values = params.getAll(key).map((v) => {
      const num = Number(v);
      return !isNaN(num) && v.trim() !== "" ? num : v;
    });
    obj[key] = values.length > 1 ? values : values[0];
  });
  return obj;
};

export default function AppFilter({
  pagination,
  children,
  title = "Filtros",
}: AppFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const methods = useForm();
  const { reset, handleSubmit } = methods;

  useEffect(() => {
    const params = getParamsFromUrl(searchParams);
    reset(params);
  }, [reset, searchParams]);

  function handleOpen() {
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
  }

  const onSubmit = (data: any) => {
    const newParams = new URLSearchParams(searchParams.toString());

    Object.entries(data).forEach(([key, value]) => {
      newParams.delete(key);
      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (v !== undefined && v !== null && v !== "") {
            newParams.append(key, String(v));
          }
        });
      } else if (value !== undefined && value !== null && value !== "") {
        newParams.set(key, String(value));
      }
    });

    newParams.set("page", "1");

    router.push(`${pathname}?${newParams.toString()}`);
    pagination.load({ params: getParamsFromUrl(newParams), replace: true });
    handleClose();
  };

  function handleClear() {
    reset({});
    router.push(pathname);
    pagination.load({ params: { page: 1 }, replace: true });
    handleClose();
  }

  const hasActiveFilters = Object.keys(getParamsFromUrl(searchParams)).some(
    (key) => !["page", "page_size", "search"].includes(key),
  );

  return (
    <>
      <AppButton
        color="background"
        onClick={handleOpen}
        className={`px-4 shrink-0 relative ${hasActiveFilters ? "text-primary dark:text-foreground border-primary! dark:border-foreground!" : ""}`}
      >
        <FilterList fontSize="small" />
        Filtros
        {hasActiveFilters && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary dark:bg-foreground rounded-full border-2 border-background" />
        )}
      </AppButton>

      <AppModal isOpen={isOpen} onClose={handleClose} title={title}>
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 gap-4">{children}</div>

            <div className="mt-2 flex justify-between gap-2 ">
              <AppButton
                type="button"
                onClick={handleClear}
                color="background"
                className="px-4"
              >
                <DeleteSweepOutlined fontSize="small" />
                Limpar filtros
              </AppButton>

              <AppButton type="submit" color="primary" className="px-6">
                Aplicar
              </AppButton>
            </div>
          </form>
        </FormProvider>
      </AppModal>
    </>
  );
}
