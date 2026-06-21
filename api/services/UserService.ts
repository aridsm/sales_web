import {
  SignUp,
  TokenResponse,
  User,
  Login,
  RefreshToken,
} from "@/api/schemas/User";
import { axiosClient, CustomAxiosConfig } from "@/api/axiosClient";

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
    return (
      await axiosClient.post(`/${this.resource}/signup`, data, {
        skipAuth: true,
      } as CustomAxiosConfig)
    ).data;
  }

  async login(data: Login): Promise<TokenResponse> {
    const response = await axiosClient.post(`/${this.resource}/login`, data, {
      skipAuth: true,
      formEncoded: true,
    } as CustomAxiosConfig);
    return response.data;
  }

  async refreshToken(data: RefreshToken): Promise<TokenResponse> {
    const response = await axiosClient.post(
      `/${this.resource}/refresh_token`,
      data,
      {
        skipAuth: true,
      } as CustomAxiosConfig
    );
    return response.data;
  }

  async logout(): Promise<void> {
    const response = await axiosClient.post(`/${this.resource}/logout`);
    return response.data;
  }
}

export const usersService = new UserService();
