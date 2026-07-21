import NextAuth from "next-auth";
import { auth } from "@/lib/auth";

declare module "next-auth" {
  interface User {
    role?: string;
    twoFactorEnabled?: boolean;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      twoFactorEnabled: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    twoFactorEnabled?: boolean;
  }
}
