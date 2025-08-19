import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default async function middleware(req: NextRequest) {
  console.log("Middleware running for request:", req.url);

  const session = await auth();
  const homepageUrl = new URL("/", req.url);

  // Redirect to homepage if not authenticated or session is invalid
  if (req.url !== homepageUrl.toString() && (!session || !session.user || session.error === "RefreshAccessTokenError")) {
    return NextResponse.redirect(homepageUrl);
  }

  // add it to request headers so server components can reuse
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-session", JSON.stringify(session ?? {}));

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
