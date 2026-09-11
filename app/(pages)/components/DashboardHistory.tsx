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
        size: 120,
      },
      {
        column: t("labels.history.date"),
        cell: ({ row }: { row: History }) => formatDateTime(row.created_at),
        size: 160,
      },
      {
        column: t("labels.history.description"),
        cell: ({ row }: { row: History }) => row.description,
        size: 280,
      },
      {
        column: t("labels.history.entity_type"),
        cell: ({ row }: { row: History }) =>
          entityLabels[Number(row.entity_type)] || row.entity_type,
        size: 140,
      },
    ],
    [t, entityLabels],
  );

  return (
    <AppCard className="flex flex-col lg:col-span-7 min-[1580px]:col-span-8 px-4 py-4 sm:p-5 flex-1 min-h-[360px] lg:min-h-0 overflow-hidden">
      <div className="flex justify-between items-center mb-3 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="font-semibold text-base sm:text-lg">
            {t("labels.dashboard.history.title")}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-background-3 border border-border text-xs font-medium text-label">
            {t(`labels.dashboard.periods.${activePeriod}`)}
          </span>
        </div>

        <Link
          href="/history"
          className="text-xs sm:text-sm text-primary-3 dark:text-primary hover:underline shrink-0"
        >
          {t("labels.dashboard.history.view_all")}
        </Link>
      </div>

      <AppGrid
        columns={historyColumns}
        pagination={historyPagination}
        className="flex-1 w-full max-w-[100%] min-h-[280px]"
      />
    </AppCard>
  );
};
