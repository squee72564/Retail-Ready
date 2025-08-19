import type { NextAuthConfig, User } from 'next-auth';
import Keycloak from "next-auth/providers/keycloak"
import { jwtDecode, JwtPayload } from "jwt-decode";
import { AdapterUser } from 'next-auth/adapters';
import { JWT } from '@auth/core/jwt';

async function refreshAccessToken(token: JWT) {
  try {
    console.log('Attempting to refresh token...');
    
    // Check if refresh token is expired
    if (token.refreshTokenExpiresAt && Date.now() >= (token.refreshTokenExpiresAt as number)) {
      console.log('Refresh token has expired, clearing tokens');
      // Return a token that will cause re-authentication
      return {
        ...token,
        error: 'RefreshTokenExpired',
        accessToken: undefined,
        refreshToken: undefined,
        idToken: undefined,
        expiresAt: 0,
      };
    }

    const response = await fetch(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.KEYCLOAK_ID!,
        client_secret: process.env.KEYCLOAK_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      console.error('Token refresh failed:', refreshedTokens);
      return {
        ...token,
        error: 'RefreshAccessTokenError',
        accessToken: undefined,
        refreshToken: undefined,
        idToken: undefined,
        expiresAt: 0, // Force immediate expiration
      };
    }

    console.log('Token refreshed successfully');

    // Decode the new access token
    const decoded = jwtDecode(refreshedTokens.access_token) as JwtPayload & {
      realm_access?: { roles: string[] };
      resource_access?: Record<string, { roles: string[] }>;
    };

    // Decode refresh token to get its expiration (if available)
    let refreshTokenExpiresAt = token.refreshTokenExpiresAt;
    if (refreshedTokens.refresh_token) {
      try {
        const refreshDecoded = jwtDecode(refreshedTokens.refresh_token) as JwtPayload;
        refreshTokenExpiresAt = refreshDecoded.exp ? refreshDecoded.exp * 1000 : undefined;
      } catch (e) {
        console.warn('Could not decode refresh token expiration');
      }
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      idToken: refreshedTokens.id_token ?? token.idToken,
      expiresAt: decoded.exp! * 1000,
      refreshTokenExpiresAt,
      realmRoles: decoded.realm_access?.roles || [],
      resourceRoles: decoded.resource_access || {},
      error: undefined,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
      accessToken: undefined,
      refreshToken: undefined,
      idToken: undefined,
      expiresAt: 0, // Force immediate expiration
    };
  }
}

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
    async jwt({ token, account, user }) {
      // Initial sign in
      if (account && user) {
        console.log('Initial sign in, storing tokens');
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
        console.log('Token has error and no access token, maintaining error state');
        return token;
      }

      // Return previous token if the access token has not expired yet
      // Add some buffer time (30 seconds) to refresh before actual expiration
      if (Date.now() < ((token.expiresAt as number) - 30000)) {
        return token;
      }

      console.log('Access token expired, attempting refresh...');
      // Access token has expired, try to refresh it
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      // If there's an error or no access token, the user should not have a valid session
      // But we can't return null, so we'll modify the session to indicate it's invalid
      if (token.error || !token.accessToken) {
        console.log('Invalid token state, clearing session user');
        // Clear the user to make the session appear invalid
        session.user = {} as AdapterUser & User;
        return session;
      }

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