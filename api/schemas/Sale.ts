import { SaleStatus } from "@/enums/SaleStatus";

export interface Sale {
  id: string;
  code: number;
  status: SaleStatus;
  total: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  items_count: number;
}

export interface SaleCreate {
  products: {
    product_id: string;
    quantity: number;
  }[];
}
