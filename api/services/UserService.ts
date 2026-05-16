import {
  SignUp,
  TokenResponse,
  User,
  Login,
  RefreshToken,
} from "@/api/schemas/User";
import { axiosClient } from "@/api/axiosClient";

export class UserService {
  private readonly resource = "users";

  async me(): Promise<User> {
    return await axiosClient
      .get(`/${this.resource}/me`)
      .then((res) => res.data);
  }

  async deleteMe(): Promise<void> {
    return await axiosClient
      .delete(`/${this.resource}/me`)
      .then((res) => res.data);
  }

  async signup(data: SignUp) {
    return await axiosClient.post(`/${this.resource}/signup`, data, {
      skipAuth: true,
    } as any);
  }

  async login(data: Login): Promise<TokenResponse> {
    return await axiosClient.post(`/${this.resource}/login`, data, {
      skipAuth: true,
      formEncoded: true,
    } as any);
  }

  async refreshToken(data: RefreshToken) {
    return await axiosClient.post(`/${this.resource}/refresh_token`, data, {
      skipAuth: true,
    } as any);
  }

  async logout() {
    return await axiosClient.post(`/${this.resource}/logout`);
  }
}

export const usersService = new UserService();
