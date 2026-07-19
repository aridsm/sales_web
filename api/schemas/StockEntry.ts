import { StockEntryStatus } from "@/enums/StockEntryStatus";

export interface StockEntry {
  id: string;
  status: StockEntryStatus;
  total: number;
  date: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  items_count?: number;
  code: number;
}

export interface StockEntryCreate {
  date: string;
  products: {
    product_id: string;
    quantity: number;
    unit_price: number;
  }[];
}
