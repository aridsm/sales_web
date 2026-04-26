import { axiosClient } from "@/api/axiosClient";

export class UserService {
  private readonly resource = "users";

  me() {
    return axiosClient.get(`/${this.resource}/me`);
  }

  deleteMe() {
    return axiosClient.delete(`/${this.resource}/me`);
  }

  signup(data: unknown) {
    return axiosClient.post(`/${this.resource}/signup`, data, { skipAuth: true } as any);
  }

  login(data: unknown) {
    return axiosClient.post(`/${this.resource}/login`, data, { skipAuth: true, formEncoded: true } as any);
  }

  refreshToken(data: unknown) {
    return axiosClient.post(`/${this.resource}/refresh_token`, data, { skipAuth: true } as any);
  }

  logout() {
    return axiosClient.post(`/${this.resource}/logout`);
  }
}

export const usersService = new UserService();
