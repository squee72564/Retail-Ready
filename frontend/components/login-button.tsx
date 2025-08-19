import { Button } from "@/components/ui/button";
import { startKeycloakSession } from "@/lib/keycloakSession";

export default function LoginButton() {
  return (
    <form action={startKeycloakSession}>
      <Button
        type="submit"
        variant={"default"}
        className={"w-full max-w-md mt-4"}
      >
        Merchant Sign In
      </Button>
    </form>
  );
}