import { CompanyPermission } from "@/enums/CompanyPermission";
import { InvitationStatus } from "@/enums/InvitationStatus";

export interface Company {
  id: string;
  name: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface CompanyListItem {
  id: string;
  name: string;
  permission: CompanyPermission;
  created_at: string | Date;
}

export interface CompanyUser {
  id: string;
  company_id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  permission: CompanyPermission;
  created_at: string | Date;
}

export interface CompanyInvitation {
  id: string;
  company_id: string;
  company_name: string | null;
  invited_by_name: string | null;
  invited_by_email?: string | null;
  user_id?: string | null;
  user_name?: string | null;
  user_email?: string | null;
  permission: CompanyPermission;
  status: InvitationStatus;
  created_at: string | Date;
}
