import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    refreshToken?: string;
    accessToken?: string;
    idToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    refreshToken?: string;
    accessToken?: string;
    idToken?: string;
  }
}
