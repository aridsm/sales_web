import BaseService from "@/services/BaseService";

export class OtherExpenseService extends BaseService {
  constructor() {
    super("otherExpenses");
  }
}

export const otherExpensesService = new OtherExpenseService();
