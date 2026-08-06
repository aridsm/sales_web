import { SaleStatus } from "@/enums/SaleStatus";

export interface Sale {
  id: string;
  code: number;
  status: SaleStatus;
  total: number;
  user_id: string;
  created_at: string;
  date: string;
  updated_at: string;
  items_count: number;
}

export interface SaleCreate {
  date: string;
  products: {
    product_id: string;
    quantity: number;
  }[];
}
