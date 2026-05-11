import { CategoryType } from "@/enums/CategoryType";
import { UUID } from "crypto";

export interface Category {
  id: UUID;
  name: string;
  color: string;
  type: CategoryType;
}

export interface CategoryForm extends Omit<Category, "id"> {}
