"use server";

import { auth, signIn, signOut } from "@/auth";

export async function endKeycloakSession() {
    const session = await auth();
    const idToken = session?.idToken;
    const clientId = process.env.KEYCLOAK_ID!;

    if (idToken) {
        await fetch(
            `http://localhost:8080/realms/retail-ready/protocol/openid-connect/logout`,
            {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    id_token_hint: idToken,
                    post_logout_redirect_uri: process.env.NEXTAUTH_URL!,
                    client_id: clientId,
                }),
            }
        );
    }

    // Clear NextAuth session
    await signOut({ redirect: true, redirectTo: "/" });
}

export async function startKeycloakSession() {
    await signIn("keycloak", { redirect: true, redirectTo: "/dashboard" });
}
