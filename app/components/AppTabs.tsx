"use client";

import React, { useState, useEffect } from "react";

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

  useEffect(() => {
    if (activeTab !== undefined) {
      setInternalTab(activeTab);
    }
  }, [activeTab]);

  const handleTabClick = (value: string) => {
    setInternalTab(value);
    onChange?.(value);
  };

  return (
    <div
      className={`flex items-center bg-background-2 dark:bg-background-3 rounded-md p-1 border border-border ${
        fullWidth ? "w-full" : "w-fit shrink-0"
      } ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = internalTab === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => handleTabClick(tab.value)}
            className={`px-3 py-1 text-sm font-medium rounded-sm transition-all duration-200 cursor-pointer whitespace-nowrap ${
              fullWidth ? "flex-1 text-center" : ""
            } ${
              isActive
                ? "bg-foreground-2 dark:bg-indigo-500 text-white dark:text-white"
                : "text-label hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
