"use client";

import { useState, type ReactNode } from "react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { MobileSidebar, Sidebar } from "@/components/dashboard/sidebar";

export function AppShell({
  email,
  children,
}: {
  email?: string;
  children: ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      <Sidebar email={email} />
      <MobileSidebar
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        email={email}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader onOpenMenu={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto px-5 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
