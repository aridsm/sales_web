import { StockEntryStatus } from "@/enums/StockEntryStatus";

export interface StockEntry {
  id: string;
  status: StockEntryStatus;
  total: number;
  discount?: number;
  date: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  items_count?: number;
  code: number;
  created_by?: string;
  created_by_name?: string;
  created_by_email?: string;
  created_by_avatar_url?: string | null;
}

export interface StockEntryCreate {
  date: string;
  discount?: number;
  products: {
    product_id: string;
    quantity: number;
    unit_price: number;
  }[];
}
