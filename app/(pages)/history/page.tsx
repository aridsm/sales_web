"use client";

import { useEffect, useMemo, useState } from "react";
import AppPage from "../../components/AppPage";
import AppGrid from "../../components/AppGrid";
import {
  usePagination,
  type PaginationService,
} from "../../utils/usePagination";
import { historyService } from "@/api/services/HistoryService";
import { History } from "@/api/schemas/History";
import { useTranslation } from "@/app/utils/i18n";
import { useSearchParams } from "next/navigation";
import { ActionType } from "@/enums/ActionType";
import { EntityType } from "@/enums/EntityType";
import { formatDateTime } from "@/app/utils/formatters/date";
import { useDialogStore } from "@/stores/dialogStore";
import AppFilter from "../../components/AppFilter";
import AppSelect from "../../components/inputs/AppSelect";
import { Controller, useFormContext } from "react-hook-form";

const actionConfig: Record<
  ActionType,
  { labelKey: string; color: string; bg: string }
> = {
  [ActionType.CREATE]: {
    labelKey: "labels.history.actions.CREATE",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  [ActionType.UPDATE]: {
    labelKey: "labels.history.actions.UPDATE",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
  },
  [ActionType.DELETE]: {
    labelKey: "labels.history.actions.DELETE",
    color: "text-red-500 dark:text-red-400",
    bg: "bg-red-500/10",
  },
  [ActionType.CANCEL]: {
    labelKey: "labels.history.actions.CANCEL",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
  },
};

export default function HistoryPage() {
  const { t } = useTranslation();
  const { openDialog } = useDialogStore();
  const [rowsSelected, setRowsSelected] = useState<History[]>([]);

  const pagination = usePagination<History>(
    historyService as unknown as PaginationService<History>,
    {},
  );

  const searchParams = useSearchParams();

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    pagination.load({ params });
  }, []);

  const entityLabels: Record<number, string> = {
    [EntityType.PRODUCT]: t("labels.history.entities.PRODUCT"),
    [EntityType.CATEGORY]: t("labels.history.entities.CATEGORY"),
    [EntityType.SALE]: t("labels.history.entities.SALE"),
    [EntityType.OTHER_EXPENSE]: t("labels.history.entities.OTHER_EXPENSE"),
  };

  const columns = useMemo(
    () => [
      {
        column: t("labels.history.action"),
        cell: ({ row }: { row: History }) => {
          const config = actionConfig[Number(row.action_type) as ActionType];
          if (!config) return <span>{row.action_type}</span>;

          return (
            <span
              className={`text-sm font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}
            >
              {t(config.labelKey)}
            </span>
          );
        },
        size: 150,
      },
      {
        column: t("labels.history.description"),
        cell: ({ row }: { row: History }) => row.description,
        size: 350,
      },
      {
        column: t("labels.history.entity_type"),
        cell: ({ row }: { row: History }) =>
          entityLabels[Number(row.entity_type)] || row.entity_type,
        size: 200,
      },
      {
        column: t("labels.history.date"),
        cell: ({ row }: { row: History }) => formatDateTime(row.created_at),
        size: 200,
      },
      {
        column: t("labels.history.entity_id"),
        cell: ({ row }: { row: History }) => row.entity_id,
        size: 350,
      },
    ],
    [t, entityLabels],
  );

  function onDeleteSelected() {
    openDialog({
      variant: "confirm",
      title: t("labels.history.delete_title"),
      message:
        rowsSelected.length === 1
          ? t("labels.history.delete_single")
          : t("labels.history.delete_multiple", {
              count: rowsSelected.length,
            }),
      confirmLabel: t("labels.all.delete"),
      onConfirm: async () => {
        try {
          const ids = rowsSelected.map((item) => item.id);
          await historyService.bulkDelete(ids);
          await pagination.load();
          setRowsSelected([]);
        } catch (error: any) {
          openDialog({
            variant: "error",
            message: t("errors.fallback"),
          });
        }
      },
    });
  }

  return (
    <AppPage title={t("labels.history.title")}>
      <AppGrid
        columns={columns}
        pagination={pagination}
        selectedRows={rowsSelected}
        onSelectedChange={(rows) => setRowsSelected(rows)}
        onDeleteSelected={onDeleteSelected}
        search
        filter={
          <AppFilter pagination={pagination}>
            <HistoryFilterFields />
          </AppFilter>
        }
      />
    </AppPage>
  );
}

function HistoryFilterFields() {
  const { t } = useTranslation();
  const { control } = useFormContext();

  const actionTypeOptions = [
    { id: ActionType.CREATE, name: t("labels.history.actions.CREATE") },
    { id: ActionType.UPDATE, name: t("labels.history.actions.UPDATE") },
    { id: ActionType.DELETE, name: t("labels.history.actions.DELETE") },
    { id: ActionType.CANCEL, name: t("labels.history.actions.CANCEL") },
  ];

  const entityTypeOptions = [
    { id: EntityType.PRODUCT, name: t("labels.history.entities.PRODUCT") },
    { id: EntityType.CATEGORY, name: t("labels.history.entities.CATEGORY") },
    { id: EntityType.SALE, name: t("labels.history.entities.SALE") },
    {
      id: EntityType.OTHER_EXPENSE,
      name: t("labels.history.entities.OTHER_EXPENSE"),
    },
  ];

  return (
    <>
      <Controller
        name="action_type"
        control={control}
        render={({ field }) => (
          <AppSelect
            label={t("labels.history.action")}
            placeholder={t("labels.history.filter_action")}
            options={actionTypeOptions}
            value={field.value}
            multiple
            onChange={field.onChange}
          />
        )}
      />
      <Controller
        name="entity_type"
        control={control}
        render={({ field }) => (
          <AppSelect
            label={t("labels.history.entity_type")}
            placeholder={t("labels.history.filter_entity_type")}
            options={entityTypeOptions}
            value={field.value}
            multiple
            onChange={field.onChange}
          />
        )}
      />
    </>
  );
}
