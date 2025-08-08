"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <>
      <form
        className="bg-white rounded-lg shadow p-6 w-full max-w-lg flex flex-col gap-4"
        onSubmit={e => {
          e.preventDefault();
          // Handle login logic here
        }}
      >
        <h2 className="font-semibold text-lg mb-2 text-center">Log In</h2>
        <input
          className="border rounded px-3 py-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className="border rounded px-3 py-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full">Log In</Button>
        <Link href={"/signup"}>
          <Button className="w-full max-w-lg">Sign Up</Button> 
        </Link>
      </form>
    </>
  )
}