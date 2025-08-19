// lib/cachedAuth.ts
import { headers } from "next/headers";
import { auth } from "@/auth";

export async function cachedAuth() {
  const sessionHeader = (await headers()).get("x-session");
  if (sessionHeader) {
    return JSON.parse(sessionHeader);
  }
  // fallback: if middleware wasn’t applied
  return auth();
}
