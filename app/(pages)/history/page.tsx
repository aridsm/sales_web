"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { ACTION_CONFIG } from "@/app/utils/constants";
import AppPage from "../../components/AppPage";
import AppGrid from "../../components/AppGrid";
import {
  usePagination,
  type PaginationService,
} from "../../utils/usePagination";
import { historyService } from "@/api/services/HistoryService";
import { History } from "@/api/schemas/History";
import { useTranslation } from "@/app/utils/i18n";

import { ActionType } from "@/enums/ActionType";
import { EntityType } from "@/enums/EntityType";
import { formatDateTime } from "@/app/utils/formatters/date";
import AppCreatedBy from "@/app/components/AppCreatedBy";
import { useDialogStore } from "@/stores/dialogStore";
import { DeleteOutlined } from "@mui/icons-material";
import AppSearchInput from "../../components/inputs/AppSearchInput";
import AppButton from "../../components/AppButton";
import AppFilter from "../../components/AppFilter";
import AppSelect from "../../components/inputs/AppSelect";
import { Controller, useFormContext } from "react-hook-form";
import AppDateRange from "../../components/inputs/AppDateRange";

export default function HistoryPage() {
  const { t } = useTranslation();
  const { openDialog } = useDialogStore();
  const [rowsSelected, setRowsSelected] = useState<History[]>([]);
  const [search, setSearch] = useState("");

  const [filterParams, setFilterParams] = useState<Record<string, unknown>>({});
  const handleFilterChange = useCallback(
    (params: Record<string, unknown>) => setFilterParams(params),
    [],
  );

  const pagination = usePagination<History>(
    historyService as unknown as PaginationService<History>,
    {},
  );

  useEffect(() => {
    pagination.load({ replace: true, params: { ...filterParams, search: search || undefined } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterParams]);

  const entityLabels: Record<number, string> = {
    [EntityType.PRODUCT]: t("labels.history.entities.PRODUCT"),
    [EntityType.CATEGORY]: t("labels.history.entities.CATEGORY"),
    [EntityType.SALE]: t("labels.history.entities.SALE"),
    [EntityType.OTHER_EXPENSE]: t("labels.history.entities.OTHER_EXPENSE"),
    [EntityType.STOCK_ENTRY]: t("labels.history.entities.STOCK_ENTRY"),
  };

  const columns = useMemo(
    () => [
      {
        column: t("labels.history.action"),
        cell: ({ row }: { row: History }) => {
          const config = ACTION_CONFIG[Number(row.action_type) as ActionType];
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
        column: t("labels.all.created_by"),
        cell: ({ row }: { row: History }) => (
          <AppCreatedBy
            name={row.created_by_name}
            date={row.created_at}
            email={row.created_by_email}
            avatarUrl={row.created_by_avatar_url}
          />
        ),
        size: 280,
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
        } catch (error: unknown) {
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
      <div className="flex items-center justify-between gap-2 min-[900px]:gap-3 mb-3">
        <AppSearchInput
          value={search}
          onChange={setSearch}
          onSearch={(val) =>
            pagination.load({ params: { ...filterParams, search: val || undefined, page: 1 } })
          }
          placeholder={t("labels.grid.search_placeholder")}
          className="w-full min-w-0 sm:max-w-sm"
        />

        <div className="flex items-center gap-2 min-[900px]:gap-3 shrink-0">
          {rowsSelected.length > 0 && (
            <AppButton
              onClick={onDeleteSelected}
              color="red"
              className="w-8 min-w-8 px-0 md:w-auto md:min-w-0 md:px-3.5 shrink-0"
              title={`${t("labels.all.delete")} (${rowsSelected.length})`}
              aria-label={`${t("labels.all.delete")} (${rowsSelected.length})`}
            >
              <DeleteOutlined fontSize="small" />
              <span className="hidden md:inline">
                {t("labels.all.delete")} ({rowsSelected.length})
              </span>
            </AppButton>
          )}

          <AppFilter
            onChange={handleFilterChange}
            validKeys={["action_type", "entity_type", "created_at"]}
          >
            <HistoryFilterFields />
          </AppFilter>
        </div>
      </div>

      <AppGrid
        columns={columns}
        pagination={pagination}
        selectedRows={rowsSelected}
        onSelectedChange={(rows) => setRowsSelected(rows)}
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
    {
      id: EntityType.STOCK_ENTRY,
      name: t("labels.history.entities.STOCK_ENTRY"),
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
            clearable
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
            clearable
            onChange={field.onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="created_at"
        render={({ field }) => (
          <AppDateRange label={t("labels.history.date")} showTime {...field} />
        )}
      />
    </>
  );
}
