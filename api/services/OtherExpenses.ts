import BaseService from "@/api/services/BaseService";

export class OtherExpenseService extends BaseService {
  constructor() {
    super("other_expenses");
  }
}

export const otherExpensesService = new OtherExpenseService();
