import BaseService from "@/api/services/BaseService";
import { History } from "@/api/schemas/History";

export class HistoryService extends BaseService<History> {
  constructor() {
    super("history");
  }
}

export const historyService = new HistoryService();
