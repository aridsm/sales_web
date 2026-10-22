"use client";

import React, { useState, useEffect, useRef } from "react";

export interface AppTabItem {
  value: string;
  label: React.ReactNode;
}

interface AppTabsProps {
  tabs: AppTabItem[];
  activeTab?: string;
  onChange?: (value: string) => void;
  className?: string;
  fullWidth?: boolean;
  direction?: "row" | "column";
}

export default function AppTabs({
  tabs,
  activeTab,
  onChange,
  className = "",
  fullWidth = false,
  direction = "row",
}: AppTabsProps) {
  const [internalTab, setInternalTab] = useState<string>(
    activeTab ?? tabs[0]?.value ?? "",
  );
  const currentTab = activeTab ?? internalTab;
  const [pillStyle, setPillStyle] = useState<React.CSSProperties>({
    opacity: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const isColumn = direction === "column";

  useEffect(() => {
    const updatePill = () => {
      const el = tabRefs.current.get(currentTab);
      if (el) {
        if (isColumn) {
          setPillStyle({
            top: el.offsetTop,
            height: el.offsetHeight,
            left: el.offsetLeft,
            width: el.offsetWidth,
            opacity: 1,
          });
        } else {
          setPillStyle({
            left: el.offsetLeft,
            width: el.offsetWidth,
            top: el.offsetTop,
            height: el.offsetHeight,
            opacity: 1,
          });
        }
      }
    };

    updatePill();

    const container = containerRef.current;
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && container) {
      ro = new ResizeObserver(() => {
        updatePill();
      });
      ro.observe(container);
    }

    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(updatePill);
    }

    window.addEventListener("resize", updatePill);

    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", updatePill);
    };
  }, [currentTab, tabs, isColumn]);

  const handleTabClick = (value: string) => {
    if (activeTab === undefined) {
      setInternalTab(value);
    }
    onChange?.(value);
  };

  return (
    <div
      ref={containerRef}
      className={`relative box-border border border-border bg-background-2 dark:bg-background-3 rounded-xs p-1 gap-0.5 min-w-0 ${
        isColumn
          ? `${fullWidth ? "w-full" : "w-fit shrink-0 min-w-56 sm:min-w-64"} flex flex-col items-stretch`
          : `inline-flex items-center ${fullWidth ? "w-full" : "w-fit shrink-0"}`
      } ${className}`}
    >
      <div
        className={`absolute rounded-xs bg-primary shadow-xs transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none ${
          isColumn ? "inset-x-1" : "inset-y-1"
        }`}
        style={
          isColumn
            ? {
                top: pillStyle.top,
                height: pillStyle.height,
                opacity: pillStyle.opacity,
              }
            : {
                left: pillStyle.left,
                width: pillStyle.width,
                opacity: pillStyle.opacity,
              }
        }
      />

      {tabs.map((tab) => {
        const isActive = currentTab === tab.value;
        return (
          <button
            key={tab.value}
            ref={(el) => {
              if (el) tabRefs.current.set(tab.value, el);
              else tabRefs.current.delete(tab.value);
            }}
            onClick={() => handleTabClick(tab.value)}
            className={`relative z-[1] text-xs sm:text-sm rounded-xs transition-colors duration-150 cursor-pointer select-none min-w-0 overflow-hidden flex items-center ${
              isColumn
                ? "w-full h-9.5 px-3.5 justify-start gap-2 text-left"
                : `h-7 sm:h-8.5 px-4 sm:px-5 justify-center ${fullWidth ? "flex-1 text-center" : ""}`
            } ${isActive ? "text-white " : "text-label hover:text-foreground"}`}
          >
            <span
              className={`truncate w-full min-w-0 flex items-center gap-2 [&>*]:truncate ${
                isColumn
                  ? "justify-start text-left"
                  : "justify-center text-center"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
