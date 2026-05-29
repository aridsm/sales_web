import BaseService from "@/api/services/BaseService";
import { Sale, SaleCreate } from "@/api/schemas/Sale";
import { axiosClient } from "../axiosClient";

export class SaleService extends BaseService<Sale, SaleCreate> {
  constructor() {
    super("sales");
  }

  // async create(data: SaleCreate) {
  //   return (await axiosClient.post(`/${this.resource}`, data)).data;
  // }

  async cancel(id: string) {
    return (await axiosClient.post(`/${this.resource}/${id}/cancel`)).data;
  }
}

export const salesService = new SaleService();
