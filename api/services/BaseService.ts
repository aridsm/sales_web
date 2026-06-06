import { axiosClient } from "@/api/axiosClient";

export default class BaseService<TEntity = unknown, TFormDto = TEntity> {
  constructor(protected readonly resource: string) {}

  async getById(id: string | number): Promise<TEntity> {
    return await axiosClient
      .get(`/${this.resource}/${id}`)
      .then((res) => res.data);
  }

  async getAll<TResponse = TEntity[]>(
    params?: Record<string, unknown>,
  ): Promise<TResponse> {
    return await axiosClient
      .get(`/${this.resource}`, { params })
      .then((res) => res.data);
  }

  async delete(id: string | number): Promise<void> {
    return await axiosClient
      .delete(`/${this.resource}/${id}`)
      .then((res) => res.data);
  }

  async bulkDelete(ids: (string | number)[]): Promise<void> {
    return await axiosClient
      .delete(`/${this.resource}/bulk`, { data: { ids } })
      .then((res) => res.data);
  }

  async post(data: TFormDto): Promise<TEntity> {
    return await axiosClient
      .post(`/${this.resource}`, data)
      .then((res) => res.data);
  }

  async patch(id: string | number, data: Partial<TFormDto>): Promise<TEntity> {
    return await axiosClient
      .patch(`/${this.resource}/${id}`, data)
      .then((res) => res.data);
  }
}
