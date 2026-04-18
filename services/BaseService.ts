import { axiosClient } from "@/api/axiosClient";

export default class BaseService {
  constructor(protected readonly resource: string) {}

  getById(id: string | number) {
    return axiosClient.get(`/${this.resource}/${id}`);
  }

  getAll(params?: Record<string, unknown>) {
    return axiosClient
      .get(`/${this.resource}`, { params })
      .then((res) => res.data);
  }

  delete(id: string | number) {
    return axiosClient.delete(`/${this.resource}/${id}`);
  }

  post(data: unknown) {
    return axiosClient.post(`/${this.resource}`, data);
  }

  patch(id: string | number, data: unknown) {
    return axiosClient.patch(`/${this.resource}/${id}`, data);
  }
}
