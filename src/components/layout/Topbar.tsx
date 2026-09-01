"use client";

import { Search, Bell, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useSidebar } from "@/context/SidebarContext";

interface TopbarProps {
  title: string;
  description?: string;
}

export function Topbar({ title, description }: TopbarProps) {
  const { openMobile } = useSidebar();

  return (
    <header className="no-print flex items-center justify-between gap-3 border-b border-base-600/60 bg-base-900/60 px-4 sm:px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={openMobile}
          aria-label="Open menu"
          className="md:hidden shrink-0 rounded-lg border border-base-600 bg-base-800 p-2 text-ink-300 hover:text-ink-100 transition-colors"
        >
          <Menu size={16} />
        </button>
        <div className="min-w-0">
          <h1 className="font-display text-base sm:text-lg font-semibold text-ink-100 truncate">
            {title}
          </h1>
          {description && (
            <p className="hidden sm:block text-sm text-ink-500 truncate">{description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="hidden lg:flex items-center gap-2 rounded-lg border border-base-600 bg-base-800 px-3 py-1.5">
          <Search size={14} className="text-ink-500" />
          <input
            placeholder="Search this workspace…"
            className="w-48 bg-transparent text-sm text-ink-100 placeholder:text-ink-500 outline-none"
          />
        </div>
        <button className="relative rounded-lg border border-base-600 bg-base-800 p-2 text-ink-300 hover:text-ink-100 transition-colors">
          <Bell size={16} />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-signal-amber" />
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
