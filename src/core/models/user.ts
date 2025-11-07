import type { Role } from "@/core/models/role.ts";

export interface User {
  first_name: string;
  last_name: string;
  email: string;
  roles: Role[];
  created_at?: Date | null;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}
