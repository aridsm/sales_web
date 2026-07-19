export interface StockEntryProduct {
  id: string;
  stock_entry_id: string;
  product_id: string;
  user_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
  product_name?: string;
  category_name?: string;
  category_color?: string;
}
