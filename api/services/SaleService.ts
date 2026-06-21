import BaseService from "@/api/services/BaseService";
import { Sale, SaleCreate } from "@/api/schemas/Sale";
import { axiosClient } from "@/api/axiosClient";

export class SaleService extends BaseService<Sale, SaleCreate> {
  constructor() {
    super("sales");
  }

  async cancel(id: string) {
    return (await axiosClient.post(`/${this.resource}/${id}/cancel`)).data;
  }
}

export const salesService = new SaleService();
