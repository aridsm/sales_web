"use client";

import { createContext, useContext } from "react";
import { StockEntry } from "@/api/schemas/StockEntry";

export interface StockEntriesContextType {
  updateStockEntry: (entry: Partial<StockEntry> & { id: string }) => void;
  refreshStockEntries: () => void;
}

export const StockEntriesContext =
  createContext<StockEntriesContextType | null>(null);

export function useStockEntries() {
  return useContext(StockEntriesContext);
}
