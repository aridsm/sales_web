export interface UserBase {
  name: string;
  email: string;
}

export interface User extends UserBase {
  id: string;
  created_at: string | Date;
}

export type UserForm = UserBase;

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
