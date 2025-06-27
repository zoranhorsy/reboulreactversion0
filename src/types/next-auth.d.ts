import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    username: string;
    is_admin: boolean;
    token?: string;
    avatar_url?: string;
    created_at?: string;
    status?: "active" | "suspended" | "banned";
  }

  interface Session {
    user: {
      id: string;
      email: string;
      username: string;
      is_admin: boolean;
      token?: string;
      avatar_url?: string;
      created_at?: string;
      status?: "active" | "suspended" | "banned";
    };
  }
}
