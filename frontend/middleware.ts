import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

/**
 * Middleware to check authentication and redirect to homepage if not authenticated.
 * 
 * @param {NextRequest} req - The incoming request object.
 * @returns {NextResponse} The response object, either continuing the request or redirecting.
 */
export default async function middleware(req: NextRequest): Promise<NextResponse<unknown>> {
  console.log("Middleware running for request:", req.url);
  
  const homepageUrl = new URL("/", req.url);
  
  // If the request is for the homepage, we can skip further checks
  if (req.url === homepageUrl.toString()) {
    return NextResponse.next();
  }

  // Attempt to get the session
  const session = await auth();

  // Redirect to homepage if not authenticated or session is invalid
  if (!session || !session.user || session.error === "RefreshAccessTokenError") {
    return NextResponse.redirect(homepageUrl);
  }

  // If session is valid, add it to the request headers
  console.log("- Session found, adding to header");
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-session", JSON.stringify(session ?? {}));

  // @/lib/cachedAuth.ts will use this header to get the session
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:png|ico|jpg|jpeg|svg|gif|webp)$).*)",],
};
