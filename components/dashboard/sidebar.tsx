"use client";

import { X } from "lucide-react";

import { SidebarNav } from "@/components/dashboard/sidebar-nav";

export function Sidebar({ email }: { email?: string }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-shell text-shell-foreground lg:flex">
      <SidebarNav email={email} />
    </aside>
  );
}

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
  email?: string;
}

export function MobileSidebar({ open, onClose, email }: MobileSidebarProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative flex h-full w-64 flex-col bg-shell text-shell-foreground">
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-[4px] text-shell-muted hover:bg-shell-raised hover:text-shell-foreground"
        >
          <X size={18} />
        </button>
        <SidebarNav email={email} onNavigate={onClose} />
      </div>
    </div>
  );
}
