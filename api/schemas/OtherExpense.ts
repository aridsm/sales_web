interface OtherExpenseBase {
  name: string;
  category_id: string;
  value: number;
  description?: string;
  date: string;
}

export interface OtherExpense extends OtherExpenseBase {
  id: string;
  category_name: string;
  category_color: string;
  user_id: string;
  created_at: string;
  created_by?: string;
  created_by_name?: string;
  created_by_email?: string;
}

export interface OtherExpenseForm extends OtherExpenseBase {
  id?: string;
}
