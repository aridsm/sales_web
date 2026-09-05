export interface History {
  id: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  description: string;
  details: Record<string, unknown> | null;
  created_at: string;
  created_by?: string;
  created_by_name?: string;
  created_by_email?: string;
}
