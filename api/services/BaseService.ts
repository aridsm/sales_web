import { axiosClient } from "@/api/axiosClient";

export default class BaseService<TEntity = unknown, TFormDto = TEntity> {
  constructor(protected readonly resource: string) {}

  getById(id: string | number): Promise<TEntity> {
    return axiosClient.get(`/${this.resource}/${id}`).then((res) => res.data);
  }

  getAll<TResponse = TEntity[]>(
    params?: Record<string, unknown>,
  ): Promise<TResponse> {
    return axiosClient
      .get(`/${this.resource}`, { params })
      .then((res) => res.data);
  }

  delete(id: string | number): Promise<void> {
    return axiosClient
      .delete(`/${this.resource}/${id}`)
      .then((res) => res.data);
  }

  bulkDelete(ids: (string | number)[]): Promise<void> {
    return axiosClient
      .delete(`/${this.resource}/bulk`, { data: { ids } })
      .then((res) => res.data);
  }

  post(data: TFormDto): Promise<TEntity> {
    return axiosClient.post(`/${this.resource}`, data).then((res) => res.data);
  }

  patch(id: string | number, data: Partial<TFormDto>): Promise<TEntity> {
    return axiosClient
      .patch(`/${this.resource}/${id}`, data)
      .then((res) => res.data);
  }
}
