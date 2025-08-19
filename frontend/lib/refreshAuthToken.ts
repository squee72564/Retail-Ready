import { JWT } from '@auth/core/jwt';
import { jwtDecode, JwtPayload } from "jwt-decode";

export default async function refreshAccessToken(token: JWT) {
  try {    
    // Check if refresh token is expired
    if (token.refreshTokenExpiresAt && (Date.now() >= (token.refreshTokenExpiresAt as number))) {
      console.log('- Refresh token has expired, clearing tokens');
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

    console.log('- Token refreshed successfully');

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
        console.log('Decoded refresh token expiration:', refreshDecoded.exp);

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
