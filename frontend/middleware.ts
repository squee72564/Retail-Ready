import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export default async function middleware(req: NextRequest) {
  // run auth() once here
  const session = await auth();

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
