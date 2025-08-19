"use client";

import { useEffect, useState } from "react";
import { Session } from "next-auth";
import { Button } from "@/components/ui/button";

export default function GoTest({session}: {session: Session}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toLocaleString());

  const testAPI = async () => {
    if (!session?.accessToken) {
      console.error("No access token available");
      return;
    }
    try {
      const res = await fetch("http://localhost:8081/v1/hello", {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setMessage(data.message || "No message");
      setDate(new Date().toLocaleString());
    } catch (err) {
      console.error("Error fetching data:", err);
      setError((err as Error).message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAPI(); // Call the API when the component mounts
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Go Test Page</h1>
        <Button onClick={testAPI} className="px-4 py-2 bg-blue-500 text-white mb-4">
          Test Go API
        </Button>
        {loading && <p className="text-gray-700">Loading...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && (
          <p className="text-green-600">✅ Response {date}: {message}</p>
        )}
      </div>
    </div>
  );
}
