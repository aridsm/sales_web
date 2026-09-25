import { CompanyPermission } from "@/enums/CompanyPermission";
import { InvitationStatus } from "@/enums/InvitationStatus";

export interface Company {
  id: string;
  name: string;
  logo_url?: string | null;
  document?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  zip_code?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  created_at: string | Date;
  updated_at?: string | Date;
}

export interface CompanyListItem extends Company {
  permission: CompanyPermission;
}

export interface CompanyUser {
  id: string;
  company_id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  user_avatar_url?: string | null;
  user_phone?: string | null;
  user_job_title?: string | null;
  user_document?: string | null;
  user_zip_code?: string | null;
  user_street?: string | null;
  user_number?: string | null;
  user_complement?: string | null;
  user_neighborhood?: string | null;
  user_city?: string | null;
  user_state?: string | null;
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
