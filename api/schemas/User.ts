import { CompanyPermission } from "@/enums/CompanyPermission";

export interface UserBase {
  name: string;
  email: string;
  phone?: string | null;
  job_title?: string | null;
  document?: string | null;
  avatar_url?: string | null;
  zip_code?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
}

export interface User extends UserBase {
  id: string;
  created_at: string | Date;
  company_id?: string | null;
  permission?: CompanyPermission | null;
}

export type UserForm = Partial<UserBase>;

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface SignUp extends UserBase {
  password: string;
}

export interface Login {
  password: string;
  email: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  token_type: string;
}

export interface RefreshToken {
  refresh_token: string;
}
