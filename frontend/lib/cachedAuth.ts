import { headers } from "next/headers";
import { auth } from "@/auth";

export async function cachedAuth() {
  const sessionHeader = (await headers()).get("x-session");
  if (sessionHeader) {
    console.log("Using cached session from headers");
    return JSON.parse(sessionHeader);
  }

  console.log("No cached session found, calling auth directly");
  return auth();
}
