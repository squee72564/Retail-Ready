import { Button } from "@/components/ui/button";
import { endKeycloakSession } from "@/lib/keycloakSession";

export default function LogoutButton() {
  return (
    <form action={endKeycloakSession}>
      <Button
        type="submit"
        variant={"destructive"}
      >
        Sign Out
      </Button>
    </form>
  );
}
