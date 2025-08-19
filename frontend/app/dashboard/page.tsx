import LogoutButton from "@/components/logout-button";
import HealthCheck from "./health-check";
import GoTest from "./go-test";
import { cachedAuth } from "@/lib/cachedAuth";

export default async function Dashboard() {
    const session = await cachedAuth();

    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full m-10 gap-4">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
          <pre className="text-blue-500 w-full overflow-x-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        {session && <HealthCheck session={session}/>}
        {session && <GoTest session={session} />}
        <LogoutButton />
      </div>
    );
}
