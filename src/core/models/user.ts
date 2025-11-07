import type { Role } from "@/core/models/role.ts";

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  roles: Role[];
  activated_at: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
