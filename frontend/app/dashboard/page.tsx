import { auth, signOut } from "@/auth";

export default async function Dashboard() {
    const session = await auth();
    const user = session?.user;


    console.log("Session:", session);
    return (
        <div className="flex items-center justify-center h-screen">
            {/* Implement SignOut */}
            <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={async () => {
                    "use server";
                    await signOut({ redirect: true, redirectTo: "/" })}
                }
            >
                Sign Out
            </button>
            
        </div>
    );
}