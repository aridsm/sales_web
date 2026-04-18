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
    return axiosClient.post(`/${this.resource}/signup`, data);
  }

  login(data: unknown) {
    return axiosClient.post(`/${this.resource}/login`, data);
  }

  refreshToken(data: unknown) {
    return axiosClient.post(`/${this.resource}/refresh_token`, data);
  }

  logout() {
    return axiosClient.post(`/${this.resource}/logout`);
  }
}

export const usersService = new UserService();
