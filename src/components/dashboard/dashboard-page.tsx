"use client";

import { useMemo } from "react";
import { Navbar } from "@/components/layout";
import { AnalyticsDashboard } from "./analytics-dashboard";
import { useAccount } from "wagmi";

export default function DashboardPage() {
  const { isConnected } = useAccount();

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="mb-8">
            <h1 className="text-gradient mb-2 text-4xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Your activity overview and analytics
            </p>
          </div>
          <AnalyticsDashboard />
        </div>
      </main>
    </>
  );
}
