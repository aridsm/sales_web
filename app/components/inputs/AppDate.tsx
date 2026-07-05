"use client";

import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import AppLabel from "../AppLabel";
import {
  CalendarMonthOutlined,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import { useClickOutside } from "../../utils/useClickOutside";
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
  }: AppDateProps,
  ref: React.Ref<HTMLDivElement>,
) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => triggerRef.current as HTMLDivElement);

  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  const handleOpen = () => {
    if (disabled) return;
    setIsOpen(true);
    if (value) {
      const parsedDate = new Date(
        value.includes("T") ? value : `${value}T12:00:00`,
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

  useClickOutside(containerRef, () => {
    if (isOpen) {
      setIsOpen(false);
      onBlur?.();
    }
  });

  const handleSelectDay = (day: number) => {
    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    if (value && value.includes("T")) {
      const parsedDate = new Date(value);
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

    onChange?.(selectedDate.toISOString());
    setIsOpen(false);
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

    if (value) {
      const parsedDate = new Date(
        value.includes("T") ? value : `${value}T12:00:00`,
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

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 z-50 bg-background-2 dark:bg-background-3 border border-border rounded-md shadow-xl p-3 w-[280px]">
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

            <div className="flex gap-2 flex-1 mx-2">
              <AppSelect
                value={viewDate.getMonth()}
                onChange={(val) =>
                  setViewDate(new Date(viewDate.getFullYear(), Number(val), 1))
                }
                options={monthOptions}
                size="small"
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
        </div>
      )}
    </div>
  );
};

const AppDate = forwardRef(AppDateInner);
AppDate.displayName = "AppDate";

export default AppDate;
