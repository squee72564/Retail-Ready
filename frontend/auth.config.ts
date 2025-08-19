import type { NextAuthConfig, User } from 'next-auth';
import Keycloak from "next-auth/providers/keycloak"
import { jwtDecode, JwtPayload } from "jwt-decode";
import { AdapterUser } from 'next-auth/adapters';
import refreshAccessToken from '@/lib/refreshAuthToken';

export const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      console.log("Checking authorization for request:", nextUrl.pathname, new Date().toISOString());
      const session = auth;

      // If the user is not logged in, redirect to the login page
      if (!session || !session.user || !session.accessToken || session.error === 'RefreshAccessTokenError') {
        return Response.redirect(new URL('/', nextUrl));
      }
      
      return true;
    },
    async jwt({ token, account, user }) {
      console.log('JWT callback triggered:', new Date().toISOString());

      // If this is the initial sign in, store the tokens
      if (account && user) {
        //console.log('Initial sign in, storing tokens');
        const decoded = jwtDecode(account.access_token || "") as JwtPayload & {
          realm_access?: { roles: string[] };
          resource_access?: Record<string, { roles: string[] }>;
        };

        // Try to decode refresh token expiration
        let refreshTokenExpiresAt;
        if (account.refresh_token) {
          try {
            const refreshDecoded = jwtDecode(account.refresh_token) as JwtPayload;
            refreshTokenExpiresAt = refreshDecoded.exp ? refreshDecoded.exp * 1000 : undefined;
          } catch (e) {
            console.warn('Could not decode refresh token expiration');
          }
        }

        return {
          ...token,
          realmRoles: decoded.realm_access?.roles || [],
          resourceRoles: decoded.resource_access || {},
          refreshToken: account.refresh_token,
          accessToken: account.access_token,
          idToken: account.id_token,
          expiresAt: decoded.exp! * 1000,
          refreshTokenExpiresAt,
          error: undefined, // Clear any previous errors
        };
      }

      // If there's an error and tokens are cleared, the session will be invalid
      // but we still return a token object (just without valid tokens)
      if (token.error && !token.accessToken) {
        //console.log('Token has error and no access token, maintaining error state');
        return token;
      }

      // Return previous token if the access token has not expired yet
      // Add some buffer time (30 seconds) to refresh before actual expiration
      if (Date.now() < ((token.expiresAt as number))) {
        return token;
      }

      //console.log('Access token expired, attempting refresh...');
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      console.log('Session callback triggered:', new Date().toISOString());

      // If the token has an error or no access token, clear the session user
      // The middleware will redirect to the homepage if this happens
      if (token.error || !token.accessToken) {
        //console.log('Invalid token state, clearing session user');
        session.user = {} as AdapterUser & User;
        session.error = token.error as ("RefreshAccessTokenError" | undefined);
        return session;
      }

      session.realmRoles = token.realmRoles as string[];
      session.resourceRoles = token.resourceRoles as Record<string, { roles: string[] }>;
      // session.refreshToken = token.refreshToken as string | undefined;
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