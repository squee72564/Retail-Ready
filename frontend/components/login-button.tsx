"use client";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function LoginButton() {
  return (
    <Button
      variant={"default"}
      className={"w-full max-w-md mt-4"}
      onClick={() => signIn("keycloak", { callbackUrl: "/dashboard" })}
    >
      Merchant Sign In
    </Button>
  );
}
