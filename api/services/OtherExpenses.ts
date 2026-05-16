import BaseService from "@/api/services/BaseService";
import { OtherExpense, OtherExpenseForm } from "@/api/schemas/OtherExpense";

export class OtherExpenseService extends BaseService<
  OtherExpense,
  OtherExpenseForm
> {
  constructor() {
    super("other_expenses");
  }
}

export const otherExpensesService = new OtherExpenseService();
