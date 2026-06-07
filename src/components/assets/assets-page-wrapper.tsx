"use client";

import { Navbar } from "@/components/layout";
import { AssetsPage } from "@/components/assets/assets-page";

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        <div className="mx-auto max-w-2xl px-4 py-12">
          <div className="mb-8">
            <h1 className="text-gradient mb-2 text-4xl font-bold">Assets</h1>
            <p className="text-muted-foreground">
              View your balances and portfolio overview
            </p>
          </div>
          <AssetsPage />
        </div>
      </main>
    </>
  );
}
