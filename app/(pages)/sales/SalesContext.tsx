"use client";

import { createContext, useContext } from "react";
import { Sale } from "@/api/schemas/Sale";

export interface SalesContextType {
  updateSale: (sale: Partial<Sale> & { id: string }) => void;
  refreshSales: () => void;
}

export const SalesContext = createContext<SalesContextType | null>(null);

export function useSales() {
  return useContext(SalesContext);
}
