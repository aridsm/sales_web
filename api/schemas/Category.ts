import { CategoryType } from "@/enums/CategoryType";

export interface Category {
  id: string;
  name: string;
  color?: string | null;
  type: CategoryType;
  products?: number;
  created_at?: string | Date;
  created_by?: string;
  created_by_name?: string;
  created_by_email?: string;
  created_by_avatar_url?: string | null;
}

export interface CategoryAmount {
  items: CategoryAmountItem[];
  total: number;
}

export interface CategoryAmountItem {
  category_id: string;
  category_name: string;
  category_color: string;
  value: number;
}

export type CategoryForm = Omit<Category, "id">;
