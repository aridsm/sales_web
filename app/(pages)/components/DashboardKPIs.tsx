import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import AppCard from "../../components/AppCard";
import { useTranslation } from "@/app/utils/i18n";
import { dashboardService } from "@/api/services/DashboardService";
import { currencyFormatter } from "@/app/utils/formatters/currency";
import { ErrorOutlineRounded } from "@mui/icons-material";

function KpiInfoPopover({ title, description }: { title: string; description: string }) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1000;
    const popoverWidth = 240;

    let left = rect.left + rect.width / 2 - popoverWidth / 2;
    if (left + popoverWidth > viewportWidth - 12) {
      left = viewportWidth - popoverWidth - 12;
    }
    if (left < 12) {
      left = 12;
    }

    const top = rect.bottom + 6;
    setCoords({ top, left });
  }, []);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    updatePosition();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 120);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => {
          e.stopPropagation();
          if (!isOpen) {
            updatePosition();
            setIsOpen(true);
          } else {
            setIsOpen(false);
          }
        }}
        className="text-label/70 hover:text-primary transition-colors flex items-center justify-center shrink-0 cursor-pointer focus:outline-none"
        aria-label={title}
      >
        <ErrorOutlineRounded style={{ fontSize: 15 }} />
      </button>

      {isOpen &&
        coords &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
            className="fixed z-50 w-60 bg-background-2 dark:bg-background-3 border border-border rounded-xs shadow-dropdown p-2.5 text-foreground flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-100 pointer-events-auto"
          >
            <span className="text-xs font-semibold text-foreground">
              {title}
            </span>
            <p className="text-xs text-label leading-relaxed">
              {description}
            </p>
          </div>,
          document.body,
        )}
    </>
  );
}

export const DashboardKPIs = ({
  startDate,
  endDate,
  activePeriod,
}: {
  startDate: string;
  endDate: string;
  activePeriod: string;
}) => {
  const { t } = useTranslation();
  const [budget, setBudget] = useState<{
    current_balance: number;
    net_profit: number;
    revenue: number;
    expenses: number;
  }>({
    current_balance: 0,
    net_profit: 0,
    revenue: 0,
    expenses: 0,
  });

  useEffect(() => {
    dashboardService
      .getBudgets({
        start_date: startDate,
        end_date: endDate,
      })
      .then(
        (res: {
          current_balance: number;
          net_profit: number;
          revenue: number;
          expenses: number;
        }) => {
          setBudget({
            current_balance: res.current_balance,
            net_profit: res.net_profit,
            revenue: res.revenue,
            expenses: res.expenses,
          });
        },
      )
      .catch(console.error);
  }, [startDate, endDate]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 lg:gap-3 shrink-0">
      {Object.entries(budget).map(([key, value]) => {
        const formattedValue = currencyFormatter.mask(value);
        const label = t(`labels.dashboard.kpi.${key}`);
        const info = t(`labels.dashboard.kpi.${key}_info`);
        const periodBadge =
          key === "current_balance"
            ? t("labels.dashboard.periods.all_time")
            : t(`labels.dashboard.periods.${activePeriod}`);
        return (
          <AppCard
            key={key}
            title={formattedValue}
            className="p-2.5 sm:p-3.5 flex flex-col justify-center gap-0.5 sm:gap-1 min-w-0"
          >
            <div className="flex items-center justify-between gap-1.5 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs sm:text-sm truncate text-label">
                  {label}
                </span>
                <KpiInfoPopover title={label} description={info} />
              </div>
              <span className="px-1.5 py-0.5 rounded-xs border border-border text-[11px] font-medium text-foreground-2 shrink-0">
                {periodBadge}
              </span>
            </div>
            <span className="text-base sm:text-xl font-semibold sm:font-bold tracking-tight truncate text-foreground">
              {formattedValue}
            </span>
          </AppCard>
        );
      })}
    </div>
  );
};
