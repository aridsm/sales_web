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
}

export interface ProductForm extends ProductBase {}
