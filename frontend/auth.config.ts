import type { NextAuthConfig } from 'next-auth';
import Keycloak from "next-auth/providers/keycloak"
import { jwtDecode, JwtPayload } from "jwt-decode";

export const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnHomepage = nextUrl.pathname === '/';

      // If the user is not logged in, redirect to the login page
      if (!isLoggedIn && !isOnHomepage) {
        return Response.redirect(new URL('/', nextUrl));
      }
      return true;
    },
    async jwt({ token, account, user}) {
      if (account && user) {
        const decoded = jwtDecode(account.access_token || "") as JwtPayload & {
          realm_access?: { roles: string[] };
          resource_access?: Record<string, { roles: string[] }>;
        };
        token.realmRoles = decoded.realm_access?.roles || [];
        token.resourceRoles = decoded.resource_access || {};
        token.refreshToken = account.refresh_token; 
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      return token;
    },

    async session({ session, token }) {
      session.realmRoles = token.realmRoles as string[];
      session.resourceRoles = token.resourceRoles as Record<string, { roles: string[] }>;
      session.refreshToken = token.refreshToken as string | undefined;
      session.accessToken = token.accessToken as string | undefined;
      session.idToken = token.idToken as string | undefined;
      return session;
    },
  },
  providers: [
    Keycloak({
      clientId: process.env.KEYCLOAK_ID!,
      clientSecret: process.env.KEYCLOAK_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
    })
  ],
} satisfies NextAuthConfig;
