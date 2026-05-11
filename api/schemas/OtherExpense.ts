import { UUID } from "crypto";

interface OtherExpenseBase {
  name: string;
  category_id: number;
  value: number;
  description?: string;
  date: string;
}

export interface OtherExpense extends OtherExpenseBase {
  id: UUID;
  category_name: string;
  category_color: string;
  user_id: string;
  created_at: string;
}

export interface OtherExpenseForm extends OtherExpenseBase {
  id?: UUID;
}
