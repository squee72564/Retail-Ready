"use client";

import { useState } from "react";
import { Session } from "next-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HealthCheck({session}: {session: Session}) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState<null | string>(null);

  const callProtectedAPI = async () => {
    if (!session?.accessToken) {
      console.error("No access token available");
      return;
    }

    try {
        const res = await fetch("http://localhost:8081/v1/keycloak_protected", {
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
        },
        }); 
        if (!res.ok) {
          console.error("API call failed", res.status);
          return;
        }
        const data = await res.json();
        setResult(data);
    } catch (error) {
      console.error("Error calling API without Bearer token", error);
      setError(String(error));
      return;
    }
  };

  const callProtectedAPIWithoutBearer = async () => {
    if (!session?.accessToken) {
      console.error("No access token available");
      return;
    }

    try {
        const res = await fetch("http://localhost:8081/v1/keycloak_protected");
        if (!res.ok) {
        console.error("API call failed", res.status);
        return;
        }
        const data = await res.json();
        setResult(data);
    } catch (error) {
      console.error("Error calling API without Bearer token", error);
      setError(String(error));
      return;
    }

  };

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col items-center justify-center w-full">
          <Button onClick={callProtectedAPI} className="px-4 py-2 bg-green-500 text-white">
            Call Krakend Protected API
          </Button>
          {result && (
            <pre className="mt-4 bg-gray-100 p-2 rounded">{JSON.stringify(result, null, 2)}</pre>
          )}
        </div>
        <div className="flex flex-col items-center justify-center w-full">
          <Button onClick={callProtectedAPIWithoutBearer} className="px-4 py-2 bg-green-500 text-white">
            Call Krakend Protected API
          </Button>
          {result && (
            <pre className="mt-4 bg-gray-100 p-2 rounded">{JSON.stringify(result, null, 2)}</pre>
          )}
          {error && (
            <pre className="mt-4 bg-gray-100 p-2 rounded">{JSON.stringify(error, null, 2)}</pre>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
