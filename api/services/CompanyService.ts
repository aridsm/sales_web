import { axiosClient } from "@/api/axiosClient";
import { Company, CompanyListItem, CompanyUser, CompanyInvitation } from "@/api/schemas/Company";
import { CompanyPermission } from "@/enums/CompanyPermission";
import { ApiResponse } from "@/app/utils/usePagination";

export class CompanyService {
  private readonly resource = "companies";

  async create(name: string): Promise<Company> {
    return await axiosClient
      .post(`/${this.resource}`, { name })
      .then((res) => res.data);
  }

  async getAll(
    params?: Record<string, unknown>,
  ): Promise<ApiResponse<CompanyListItem>> {
    return await axiosClient
      .get(`/${this.resource}`, { params })
      .then((res) => res.data);
  }

  async getById(id: string): Promise<Company> {
    return await axiosClient
      .get(`/${this.resource}/${id}`)
      .then((res) => res.data);
  }

  async update(id: string, data: Partial<Company> | string): Promise<Company> {
    const payload = typeof data === "string" ? { name: data } : data;
    return await axiosClient
      .patch(`/${this.resource}/${id}`, payload)
      .then((res) => res.data);
  }

  async uploadLogo(companyId: string, file: File): Promise<{ logo_url: string }> {
    const formData = new FormData();
    formData.append("file", file);
    return await axiosClient
      .post(`/${this.resource}/${companyId}/logo`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.data);
  }

  async delete(id: string): Promise<void> {
    return await axiosClient
      .delete(`/${this.resource}/${id}`)
      .then((res) => res.data);
  }

  async getCompanyUsers(
    companyId: string,
    params?: Record<string, unknown>,
  ): Promise<ApiResponse<CompanyUser>> {
    return await axiosClient
      .get(`/${this.resource}/${companyId}/users`, { params })
      .then((res) => res.data);
  }

  async inviteUser(companyId: string, email: string, permission: CompanyPermission): Promise<void> {
    return await axiosClient
      .post(`/${this.resource}/${companyId}/users`, { email, permission })
      .then((res) => res.data);
  }

  async updateMember(
    companyId: string,
    userId: string,
    data: {
      permission?: CompanyPermission;
      job_title?: string | null;
      user_job_title?: string | null;
    },
  ): Promise<CompanyUser> {
    return await axiosClient
      .patch(`/${this.resource}/${companyId}/users/${userId}`, data)
      .then((res) => res.data);
  }

  async updateMemberPermission(
    companyId: string,
    userId: string,
    permission: CompanyPermission,
  ): Promise<CompanyUser> {
    return this.updateMember(companyId, userId, { permission });
  }

  async updateMemberJobTitle(
    companyId: string,
    userId: string,
    jobTitle: string | null,
  ): Promise<CompanyUser> {
    return this.updateMember(companyId, userId, {
      job_title: jobTitle,
      user_job_title: jobTitle,
    });
  }

  async removeMember(companyId: string, userId: string): Promise<void> {
    return await axiosClient
      .delete(`/${this.resource}/${companyId}/users/${userId}`)
      .then((res) => res.data);
  }

  async removeMeFromCompany(companyId: string): Promise<void> {
    return await axiosClient
      .delete(`/${this.resource}/${companyId}/users/me`)
      .then((res) => res.data);
  }

  async getInvitations(
    companyId: string,
    params?: Record<string, unknown>,
  ): Promise<CompanyInvitation[]> {
    return await axiosClient
      .get(`/${this.resource}/${companyId}/invitations`, { params })
      .then((res) => res.data);
  }

  async cancelInvitation(
    companyId: string,
    invitationId: string,
  ): Promise<void> {
    return await axiosClient
      .delete(`/${this.resource}/${companyId}/invitations/${invitationId}`)
      .then((res) => res.data);
  }
}

export const companyService = new CompanyService();
