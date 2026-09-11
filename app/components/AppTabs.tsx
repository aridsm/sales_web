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
  const [pillStyle, setPillStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    const updatePill = () => {
      const el = tabRefs.current.get(currentTab);
      const container = containerRef.current;
      if (el && container) {
        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        setPillStyle({
          left: elRect.left - containerRect.left + container.scrollLeft,
          width: elRect.width,
          height: elRect.height,
        });
      }
    };

    updatePill();
    window.addEventListener("resize", updatePill);
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", updatePill);
    }

    return () => {
      window.removeEventListener("resize", updatePill);
      if (container) {
        container.removeEventListener("scroll", updatePill);
      }
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
      className={`relative border border-border inline-flex items-center bg-background-3 dark:bg-background-3 rounded-md p-1 gap-0.5 ${
        fullWidth ? "w-full" : "w-fit shrink-0"
      } ${className}`}
    >
      <div
        className="absolute top-1 border border-border rounded-sm bg-background-2 dark:bg-gray-700/40 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none"
        style={pillStyle}
      />

      {tabs.map((tab) => {
        const isActive = currentTab === tab.value;
        return (
          <button
            key={tab.value}
            ref={(el) => {
              if (el) tabRefs.current.set(tab.value, el);
            }}
            onClick={() => handleTabClick(tab.value)}
            className={`relative z-[1] px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer whitespace-nowrap ${
              fullWidth ? "flex-1 text-center" : ""
            } ${isActive ? "text-foreground" : "text-label hover:text-foreground"}`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
