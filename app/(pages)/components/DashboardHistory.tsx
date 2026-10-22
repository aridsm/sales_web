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
import AppCreatedBy from "@/app/components/AppCreatedBy";
import Link from "next/link";

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
              className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${config.bg} ${config.color}`}
            >
              {t(config.labelKey)}
            </span>
          );
        },
        size: 110,
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
        column: t("labels.history.description"),
        cell: ({ row }: { row: History }) => row.description,
        size: 300,
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
    <AppCard className="flex flex-col lg:col-span-7 min-[1580px]:col-span-8 p-3 sm:p-4 lg:p-5 flex-1 min-h-[360px] lg:min-h-0 overflow-hidden">
      <div className="flex justify-between items-center mb-2 sm:mb-3 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap">
          <span className="font-semibold text-base sm:text-lg">
            {t("labels.dashboard.history.title")}
          </span>
          <span className="px-2 py-0.5 rounded-xs border border-border text-xs font-medium text-foreground-2">
            {t(`labels.dashboard.periods.${activePeriod}`)}
          </span>
        </div>

        <Link
          href="/history"
          className="text-xs sm:text-sm text-primary hover:underline shrink-0 font-medium"
        >
          {t("labels.dashboard.history.view_all")}
        </Link>
      </div>

      <AppGrid
        columns={historyColumns}
        pagination={historyPagination}
        className="flex-1 w-full max-w-[100%] min-h-[260px] lg:min-h-0"
      />
    </AppCard>
  );
};
