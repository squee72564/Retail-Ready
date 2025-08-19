import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    refreshToken?: string;
    accessToken?: string;
    idToken?: string;
    realmRoles: string[];
    resourceRoles: Record<string, { roles: string[] }>;
    error?: string;
  }
}

declare module "next-auth/jwt" {
  export interface JWT {
    realmRoles?: string[];
    resourceRoles?: Record<string, { roles: string[] }>;
    refreshToken: string;
    accessToken: string;
    idToken: string;
    expiresAt: number;
    refreshTokenExpiresAt?: number;
    error?: string;
  }
}