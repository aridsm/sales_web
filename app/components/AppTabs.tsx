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
}

export default function AppTabs({
  tabs,
  activeTab,
  onChange,
  className = "",
  fullWidth = false,
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

  useEffect(() => {
    const updatePill = () => {
      const el = tabRefs.current.get(currentTab);
      if (el) {
        setPillStyle({
          left: el.offsetLeft,
          width: el.offsetWidth,
          opacity: 1,
        });
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
  }, [currentTab, tabs]);

  const handleTabClick = (value: string) => {
    if (activeTab === undefined) {
      setInternalTab(value);
    }
    onChange?.(value);
  };

  return (
    <div
      ref={containerRef}
      className={`relative border border-border inline-flex items-center bg-background-2 dark:bg-background-3 rounded-xs p-1 gap-0.5 ${
        fullWidth ? "w-full" : "w-fit shrink-0"
      } ${className}`}
    >
      <div
        className="absolute inset-y-1 rounded-xs bg-primary shadow-xs transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none"
        style={pillStyle}
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
            className={`relative z-[1] h-7 sm:h-8 px-3 sm:px-4 text-xs sm:text-sm rounded-xs transition-colors duration-150 cursor-pointer whitespace-nowrap flex items-center justify-center select-none ${
              fullWidth ? "flex-1 text-center" : ""
            } ${isActive ? "text-white font-semibold" : "text-label hover:text-foreground font-medium"}`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
