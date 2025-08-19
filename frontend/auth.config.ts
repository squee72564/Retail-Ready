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
        token.expiresAt = decoded.exp! * 1000;
        return token;
      }
      if (Date.now() < (token.expiresAt as number)) {
        return token; // Token is still valid
      }

      // If the token is expired, refresh it
      try {
        const response = await fetch(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            'client_id': process.env.KEYCLOAK_ID!,
            'client_secret': process.env.KEYCLOAK_SECRET!,
            'grant_type': 'refresh_token',
            'refresh_token': token.refreshToken as string,
          }),
        });

        const refreshedToken = await response.json();
        if (!response.ok) {
          throw new Error(`Failed to refresh token: ${refreshedToken.error}`);
        }
        const decoded = jwtDecode(refreshedToken.access_token) as JwtPayload & {
          realm_access?: { roles: string[] };
          resource_access?: Record<string, { roles: string[] }>;
        };

        return {
          ...token,
          realmRoles: decoded.realm_access?.roles || [],
          resourceRoles: decoded.resource_access || {},
          refreshToken: refreshedToken.refresh_token,
          accessToken: refreshedToken.access_token,
          idToken: refreshedToken.id_token,
          expiresAt: decoded.exp! * 1000,
        };
      } catch (error) {
        console.error("Error refreshing token:", error);
        return {
          ...token,
          error: "RefreshAccessTokenError",
          accessToken: undefined,
          refreshToken: undefined,
          idToken: undefined,
        };
      }
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
