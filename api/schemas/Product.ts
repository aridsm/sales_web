export interface ProductBase {
  name: string;
  category_id: string;
  price: number;
  stock_amount: number;
  sold_amount: number;
}

export interface Product extends ProductBase {
  id: string;
  created_at: Date | string;
  category_color: string;
  category_name: string;
  created_by?: string;
  created_by_name?: string;
  created_by_email?: string;
  created_by_avatar_url?: string | null;
}

export type ProductForm = Omit<ProductBase, "sold_amount" | "stock_amount"> & {
  stock_amount?: number;
};
