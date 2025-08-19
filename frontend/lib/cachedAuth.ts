import { headers } from "next/headers";
import { auth } from "@/auth";
import { Session } from "next-auth";

/**
 * Cached authentication function that retrieves the session from headers if available,
 * otherwise calls the auth function to get a new session.
 * 
 * @returns {Promise<Session | null>} The session object or null if not authenticated.
 */
export async function cachedAuth(): Promise<Session | null> {
  const sessionHeader = (await headers()).get("x-session");
  if (sessionHeader) {
    console.log("- Using cached session from headers");
    return JSON.parse(sessionHeader) as Session;
  }

  console.log("- No cached session found, calling auth directly");
  return auth();
}
