import { useEffect, useMemo } from "react";
import AppCard from "../../components/AppCard";
import AppGrid from "../../components/AppGrid";
import { useTranslation } from "@/app/utils/i18n";
import { historyService } from "@/api/services/HistoryService";
import { History } from "@/api/schemas/History";
import {
  usePagination,
  type PaginationService,
} from "../../utils/usePagination";
import { ACTION_CONFIG } from "@/app/utils/constants";
import { ActionType } from "@/enums/ActionType";
import { formatDateTime } from "@/app/utils/formatters/date";
import Link from "next/link";
import { ChevronRight } from "@mui/icons-material";

export const DashboardHistory = ({
  entityLabels,
  startDate,
  endDate,
  activePeriod,
}: {
  entityLabels: Record<number, string>;
  startDate: string;
  endDate: string;
  activePeriod: string;
}) => {
  const { t } = useTranslation();

  const historyPagination = usePagination<History>(
    historyService as unknown as PaginationService<History>,
    { page_size: 10 },
  );

  useEffect(() => {
    historyPagination.load({
      params: { start_created_at: startDate, end_created_at: endDate },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const historyColumns = useMemo(
    () => [
      {
        column: t("labels.history.action"),
        cell: ({ row }: { row: History }) => {
          const config = ACTION_CONFIG[Number(row.action_type) as ActionType];
          if (!config) return <span>{row.action_type}</span>;
          return (
            <span
              className={`text-sm font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${config.bg} ${config.color}`}
            >
              {t(config.labelKey)}
            </span>
          );
        },
        size: 140,
      },
      {
        column: t("labels.history.date"),
        cell: ({ row }: { row: History }) => formatDateTime(row.created_at),
        size: 200,
      },
      {
        column: t("labels.history.description"),
        cell: ({ row }: { row: History }) => row.description,
        size: 410,
      },
      {
        column: t("labels.history.entity_type"),
        cell: ({ row }: { row: History }) =>
          entityLabels[Number(row.entity_type)] || row.entity_type,
        size: 180,
      },
    ],
    [t, entityLabels],
  );

  return (
    <AppCard className="flex flex-col lg:col-span-2 p-5 flex-1 overflow-hidden min-h-0">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-lg">
            {t("labels.dashboard.history.title")}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-background-3 border border-border text-xs font-medium text-label mt-0.5">
            {t(`labels.dashboard.periods.${activePeriod}`)}
          </span>
        </div>

        <Link
          href="/history"
          className="text-sm text-primary-3 dark:text-primary hover:underline"
        >
          {t("labels.dashboard.history.view_all")}
        </Link>
      </div>

      <AppGrid
        columns={historyColumns}
        pagination={historyPagination}
        className="flex-1 w-full max-w-[100%] min-h-[300px]"
      />
    </AppCard>
  );
};
