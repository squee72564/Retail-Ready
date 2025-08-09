import type { NextAuthConfig } from 'next-auth';
import Keycloak from "next-auth/providers/keycloak"

export const authConfig = {
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
  },
  providers: [
    Keycloak({
      clientId: process.env.KEYCLOAK_ID!,
      clientSecret: process.env.KEYCLOAK_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
    })
  ],
} satisfies NextAuthConfig;
