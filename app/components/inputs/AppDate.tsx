"use client";

import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useLayoutEffect,
} from "react";
import { createPortal } from "react-dom";
import AppLabel from "../AppLabel";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
import {
  CalendarMonthOutlined,
  ChevronLeft,
  ChevronRight,
  AccessTimeOutlined,
} from "@mui/icons-material";
import AppSelect from "./AppSelect";
import AppButton from "../AppButton";

interface AppDateProps {
  label?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
  name?: string;
  showTime?: boolean;
}

const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - 50 + i);

const monthOptions = months.map((m, i) => ({ id: i, name: m }));
const yearOptions = years.map((y) => ({ id: y, name: y.toString() }));

const AppDateInner = (
  {
    label,
    error,
    value,
    onChange,
    onBlur,
    disabled,
    className = "",
    showTime = false,
  }: AppDateProps,
  ref: React.Ref<HTMLDivElement>,
) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => triggerRef.current as HTMLDivElement);

  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    isAbove: boolean;
  } | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const updateCoords = () => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;

    const menuWidth = 280;
    let menuHeight = showTime ? 390 : 330;

    if (calendarRef.current) {
      const rect = calendarRef.current.getBoundingClientRect();
      menuHeight = rect.height || menuHeight;
    }

    let left = triggerRect.left;
    if (left + menuWidth > viewportWidth - 12) {
      left = viewportWidth - menuWidth - 12;
    }
    if (left < 12) {
      left = 12;
    }

    let top = triggerRect.bottom + 4;
    let isAbove = false;
    if (top + menuHeight > viewportHeight - 12) {
      const topAbove = triggerRect.top - menuHeight - 4;
      if (topAbove >= 12) {
        top = topAbove;
        isAbove = true;
      } else {
        top = Math.max(12, viewportHeight - menuHeight - 12);
        isAbove = top < triggerRect.top;
      }
    }

    setCoords({ top, left, isAbove });
  };

  useIsomorphicLayoutEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener("resize", updateCoords);
      window.addEventListener("scroll", updateCoords, { capture: true });
    } else {
      setCoords(null);
    }
    return () => {
      window.removeEventListener("resize", updateCoords);
      window.removeEventListener("scroll", updateCoords, { capture: true });
    };
  }, [isOpen]);
  const [viewDate, setViewDate] = useState(new Date());
  const [draftValue, setDraftValue] = useState<string | undefined>(value);

  const activeDraft = draftValue ? new Date(draftValue) : null;
  const selectedHour =
    activeDraft && !isNaN(activeDraft.getTime())
      ? activeDraft.getHours()
      : new Date().getHours();
  const selectedMinute =
    activeDraft && !isNaN(activeDraft.getTime())
      ? activeDraft.getMinutes()
      : new Date().getMinutes();

  const hourInputRef = useRef<HTMLInputElement>(null);
  const minuteInputRef = useRef<HTMLInputElement>(null);

  const [hourText, setHourText] = useState(
    String(selectedHour).padStart(2, "0"),
  );
  const [minuteText, setMinuteText] = useState(
    String(selectedMinute).padStart(2, "0"),
  );

  useEffect(() => {
    if (document.activeElement !== hourInputRef.current) {
      setHourText(String(selectedHour).padStart(2, "0"));
    }
  }, [selectedHour]);

  useEffect(() => {
    if (document.activeElement !== minuteInputRef.current) {
      setMinuteText(String(selectedMinute).padStart(2, "0"));
    }
  }, [selectedMinute]);

  const handleOpen = () => {
    if (disabled) return;
    updateCoords();
    setDraftValue(value);
    setIsOpen(true);
    const dateToParse = value || draftValue;
    if (dateToParse) {
      const parsedDate = new Date(
        dateToParse.includes("T") ? dateToParse : `${dateToParse}T12:00:00`,
      );
      if (!isNaN(parsedDate.getTime())) {
        setViewDate(
          new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1),
        );
      }
    } else {
      const now = new Date();
      setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement;
      if (
        containerRef.current?.contains(target) ||
        calendarRef.current?.contains(target) ||
        target.closest?.("[data-portal]")
      ) {
        return;
      }
      setIsOpen(false);
      setCoords(null);
      onBlur?.();
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [isOpen, onBlur]);

  const handleSelectDay = (day: number) => {
    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    const baseValue = draftValue || value;
    if (baseValue && baseValue.includes("T")) {
      const parsedDate = new Date(baseValue);
      if (!isNaN(parsedDate.getTime())) {
        hours = parsedDate.getHours();
        minutes = parsedDate.getMinutes();
        seconds = parsedDate.getSeconds();
      } else {
        const now = new Date();
        hours = now.getHours();
        minutes = now.getMinutes();
        seconds = now.getSeconds();
      }
    } else {
      const now = new Date();
      hours = now.getHours();
      minutes = now.getMinutes();
      seconds = now.getSeconds();
    }

    const selectedDate = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth(),
      day,
      hours,
      minutes,
      seconds,
    );

    setDraftValue(selectedDate.toISOString());
  };

  const buildDate = (
    year: number,
    month: number,
    day: number,
    hours: number,
    minutes: number,
  ) => {
    const d = new Date(year, month, day, hours, minutes, 0);
    return d.toISOString();
  };

  const handleHourChange = (hour: number) => {
    if (!activeDraft || isNaN(activeDraft.getTime())) return;
    const iso = buildDate(
      activeDraft.getFullYear(),
      activeDraft.getMonth(),
      activeDraft.getDate(),
      hour,
      selectedMinute,
    );
    setDraftValue(iso);
  };

  const handleMinuteChange = (minute: number) => {
    if (!activeDraft || isNaN(activeDraft.getTime())) return;
    const iso = buildDate(
      activeDraft.getFullYear(),
      activeDraft.getMonth(),
      activeDraft.getDate(),
      selectedHour,
      minute,
    );
    setDraftValue(iso);
  };

  const handleSave = () => {
    if (draftValue) {
      onChange?.(draftValue);
    }
    setIsOpen(false);
    setCoords(null);
    triggerRef.current?.focus();
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const formatDisplayValue = () => {
    if (!value) return "";
    const parsedDate = new Date(
      value.includes("T") ? value : `${value}T12:00:00`,
    );
    if (isNaN(parsedDate.getTime())) return value;
    const dd = String(parsedDate.getDate()).padStart(2, "0");
    const mm = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const yyyy = parsedDate.getFullYear();

    if (showTime) {
      const hh = String(parsedDate.getHours()).padStart(2, "0");
      const min = String(parsedDate.getMinutes()).padStart(2, "0");
      return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
    }

    return `${dd}/${mm}/${yyyy}`;
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    let selectedDay = -1;
    let selectedMonth = -1;
    let selectedYear = -1;

    if (draftValue) {
      const parsedDate = new Date(
        draftValue.includes("T") ? draftValue : `${draftValue}T12:00:00`,
      );
      if (!isNaN(parsedDate.getTime())) {
        selectedDay = parsedDate.getDate();
        selectedMonth = parsedDate.getMonth();
        selectedYear = parsedDate.getFullYear();
      }
    }

    const today = new Date();

    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        day === selectedDay && month === selectedMonth && year === selectedYear;
      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

      let dayClass =
        "w-8 h-8 flex items-center justify-center rounded-md text-sm cursor-pointer transition-colors";
      if (isSelected) {
        dayClass += " bg-primary text-white font-medium";
      } else if (isToday) {
        dayClass +=
          " bg-primary/10 text-primary font-medium hover:bg-primary/20";
      } else {
        dayClass += " hover:bg-background dark:hover:bg-background-2";
      }

      days.push(
        <button
          type="button"
          key={day}
          onClick={(e) => {
            e.preventDefault();
            handleSelectDay(day);
          }}
          className={dayClass}
        >
          {day}
        </button>,
      );
    }

    return days;
  };

  return (
    <div
      className={`flex flex-col gap-1 w-full relative ${className}`}
      ref={containerRef}
    >
      {label && <AppLabel htmlFor={label}>{label}</AppLabel>}

      <div
        ref={triggerRef}
        className={`input-field flex items-center justify-between cursor-pointer ${error ? "border-red-500!" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={handleOpen}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOpen();
          }
        }}
      >
        <span className={!value ? "text-foreground/40" : ""}>
          {formatDisplayValue() || "DD/MM/AAAA"}
        </span>
        <CalendarMonthOutlined className="text-label" fontSize="small" />
      </div>

      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}

      {isOpen &&
        coords &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            ref={calendarRef}
            data-portal="true"
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 9999,
            }}
            className={`bg-background-2 dark:bg-background-3 border border-border rounded-md shadow-dropdown p-3 w-[280px] ${
              coords.isAbove
                ? "animate-dropdown-open-above"
                : "animate-dropdown-open"
            }`}
          >
            <div className="flex items-center justify-between mb-4 gap-1">
              <AppButton
                rounded
                flat
                color="foreground"
                onClick={prevMonth}
                className="min-w-7! min-h-7! h-7 w-7 px-0!"
              >
                <ChevronLeft fontSize="small" />
              </AppButton>

              <div className="flex gap-2 flex-1 mx-2 w-full ">
                <AppSelect
                  value={viewDate.getMonth()}
                  onChange={(val) =>
                    setViewDate(
                      new Date(viewDate.getFullYear(), Number(val), 1),
                    )
                  }
                  options={monthOptions}
                  size="small"
                  className="flex-1"
                />

                <AppSelect
                  value={viewDate.getFullYear()}
                  onChange={(val) =>
                    setViewDate(new Date(Number(val), viewDate.getMonth(), 1))
                  }
                  options={yearOptions}
                  size="small"
                />
              </div>

              <AppButton
                rounded
                flat
                color="foreground"
                onClick={nextMonth}
                className="min-w-7! min-h-7! h-7 w-7 px-0!"
              >
                <ChevronRight fontSize="small" />
              </AppButton>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
                <div
                  key={d}
                  className="w-8 h-8 flex items-center justify-center text-xs font-medium text-foreground"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">{renderDays()}</div>

            {showTime && activeDraft && !isNaN(activeDraft.getTime()) && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                <AccessTimeOutlined
                  className="text-label"
                  style={{ fontSize: 18 }}
                />
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <input
                    ref={hourInputRef}
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={hourText}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "").slice(0, 2);
                      setHourText(raw);
                      if (raw === "") return;
                      const val = parseInt(raw, 10);
                      if (!isNaN(val) && val >= 0 && val <= 23)
                        handleHourChange(val);
                    }}
                    onBlur={() => {
                      setHourText(String(selectedHour).padStart(2, "0"));
                    }}
                    onFocus={(e) => e.target.select()}
                    className="flex-1 min-w-0 bg-background dark:bg-background-2 border border-border rounded-md py-1.5 text-sm text-foreground focus:outline-none focus:border-primary font-medium text-center"
                  />
                  <span className="text-foreground font-semibold text-lg">
                    :
                  </span>
                  <input
                    ref={minuteInputRef}
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={minuteText}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "").slice(0, 2);
                      setMinuteText(raw);
                      if (raw === "") return;
                      const val = parseInt(raw, 10);
                      if (!isNaN(val) && val >= 0 && val <= 59)
                        handleMinuteChange(val);
                    }}
                    onBlur={() => {
                      setMinuteText(String(selectedMinute).padStart(2, "0"));
                    }}
                    onFocus={(e) => e.target.select()}
                    className="flex-1 min-w-0  bg-background dark:bg-background-2 border border-border rounded-md py-1.5 text-sm text-foreground focus:outline-none focus:border-primary font-medium text-center"
                  />
                </div>
              </div>
            )}

            <AppButton
              color="primary"
              onClick={handleSave}
              disabled={!draftValue}
              className="w-full mt-3 h-9 text-sm! font-semibold"
            >
              Salvar
            </AppButton>
          </div>,
          document.body,
        )}
    </div>
  );
};

const AppDate = forwardRef(AppDateInner);
AppDate.displayName = "AppDate";

export default AppDate;
