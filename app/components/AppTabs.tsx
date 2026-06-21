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
}

export default function AppTabs({
  tabs,
  activeTab,
  onChange,
  className = "",
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
      className={`flex items-center bg-transparent rounded-md p-1 border border-border w-fit shrink-0 ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = internalTab === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => handleTabClick(tab.value)}
            className={`px-3 py-1 text-sm font-medium rounded-sm transition-all duration-200 cursor-pointer whitespace-nowrap ${
              isActive
                ? "bg-foreground-2 text-background dark:bg-yellow-300 dark:text-black"
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
