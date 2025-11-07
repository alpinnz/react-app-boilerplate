import type { User } from "@/core/models/user.ts";

export interface Auth {
  access_token: string;
  refresh_token: string;
  user: User;
}
