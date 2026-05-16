import { CategoryType } from "@/enums/CategoryType";

export interface Category {
  id: string;
  name: string;
  color: string;
  type: CategoryType;
}

export interface CategoryForm extends Omit<Category, "id"> {}
