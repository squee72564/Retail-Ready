"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import LoginButton from "@/components/login-button";

export default function Home() {
  return (
    <div className="font-sans min-h-screen flex flex-col md:flex-row items-center justify-center bg-gray-50 p-8">
      <div className="w-full md:w-1/2 flex flex-col items-center gap-6 mb-8 md:mb-0 md:pr-10">
        <h1 className="text-3xl font-bold mb-1 text-center">Cloud POS Dashboard</h1>
        <p className="text-gray-600 text-center max-w-md">
          Manage your business with order management, inventory tracking, customer management, reporting, and more—all in one place.
        </p>
        <LoginButton />
      </div>
      <div className="w-full md:w-1/2 flex flex-col items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl mb-10">
          <Card className="rounded-lg shadow bg-white hover:bg-gray-100 transition">
            <CardHeader>
              <h2 className="font-semibold text-lg mb-2">Orders</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-sm">Manage and process customer orders efficiently.</p>
            </CardContent>
          </Card>
          <Card className="rounded-lg shadow bg-white hover:bg-gray-100 transition">
            <CardHeader>
              <h2 className="font-semibold text-lg mb-2">Inventory</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-sm">Track stock levels and manage products.</p>
            </CardContent>
          </Card>
          <Card className="rounded-lg shadow bg-white hover:bg-gray-100 transition">
            <CardHeader>
              <h2 className="font-semibold text-lg mb-2">Customers</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-sm">View and manage customer data.</p>
            </CardContent>
          </Card>
          <Card className="rounded-lg shadow bg-white hover:bg-gray-100 transition">
            <CardHeader>
              <h2 className="font-semibold text-lg mb-2">Analytics</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-sm">View sales and analytics reports.</p>
            </CardContent>
          </Card>
          <Card className="rounded-lg shadow bg-white hover:bg-gray-100 transition">
            <CardHeader>
              <h2 className="font-semibold text-lg mb-2">Employees</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-sm">Manage staff and permissions.</p>
            </CardContent>
          </Card>
          <Card className="rounded-lg shadow bg-white hover:bg-gray-100 transition">
            <CardHeader>
              <h2 className="font-semibold text-lg mb-2">Settings</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-sm">Configure hardware and integrations.</p>
            </CardContent>
          </Card>
        </div>
        <footer className="text-gray-400 text-xs text-center w-full">
          &copy; {new Date().getFullYear()} Cloud POS Solution
        </footer>
      </div>
    </div>
  );
}