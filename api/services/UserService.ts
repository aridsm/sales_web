import {
  SignUp,
  SignUpResponse,
  VerifyEmailRequest,
  ResendVerificationRequest,
  MessageResponse,
  TokenResponse,
  User,
  UserBase,
  ChangePasswordRequest,
  Login,
  RefreshToken,
} from "@/api/schemas/User";
import { CompanyInvitation } from "@/api/schemas/Company";
import { axiosClient, CustomAxiosConfig } from "@/api/axiosClient";

export class UserService {
  private readonly resource = "users";

  async me(): Promise<User> {
    return await axiosClient
      .get(`/${this.resource}/me`)
      .then((res) => res.data);
  }

  async updateMe(data: Partial<UserBase>): Promise<User> {
    return await axiosClient
      .patch(`/${this.resource}/me`, data)
      .then((res) => res.data);
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    return await axiosClient
      .post(`/${this.resource}/change-password`, data)
      .then((res) => res.data);
  }

  async uploadAvatar(file: File): Promise<{ avatar_url: string }> {
    const formData = new FormData();
    formData.append("file", file);
    return await axiosClient
      .post(`/${this.resource}/me/avatar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.data);
  }

  async switchCompany(companyId: string): Promise<User> {
    return await axiosClient
      .post(`/${this.resource}/switch-company`, { company_id: companyId })
      .then((res) => res.data);
  }

  async getInvitations(): Promise<CompanyInvitation[]> {
    return await axiosClient
      .get(`/${this.resource}/invitations`)
      .then((res) => res.data);
  }

  async acceptInvitation(invitationId: string): Promise<void> {
    return await axiosClient
      .post(`/${this.resource}/invitations/${invitationId}/accept`)
      .then((res) => res.data);
  }

  async rejectInvitation(invitationId: string): Promise<void> {
    return await axiosClient
      .post(`/${this.resource}/invitations/${invitationId}/reject`)
      .then((res) => res.data);
  }

  async deleteMe(): Promise<void> {
    return await axiosClient
      .delete(`/${this.resource}/me`)
      .then((res) => res.data);
  }

  async signup(data: SignUp): Promise<SignUpResponse> {
    return (
      await axiosClient.post(`/${this.resource}/signup`, data, {
        skipAuth: true,
      } as CustomAxiosConfig)
    ).data;
  }

  async verifyEmail(data: VerifyEmailRequest): Promise<TokenResponse> {
    const response = await axiosClient.post(
      `/${this.resource}/verify-email`,
      data,
      {
        skipAuth: true,
      } as CustomAxiosConfig
    );
    return response.data;
  }

  async resendVerification(data: ResendVerificationRequest): Promise<MessageResponse> {
    const response = await axiosClient.post(
      `/${this.resource}/resend-verification`,
      data,
      {
        skipAuth: true,
      } as CustomAxiosConfig
    );
    return response.data;
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
