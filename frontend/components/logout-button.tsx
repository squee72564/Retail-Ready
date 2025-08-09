import { Button } from "@/components/ui/button";
import { endKeycloakSession } from "@/app/dashboard/server-actions";

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
