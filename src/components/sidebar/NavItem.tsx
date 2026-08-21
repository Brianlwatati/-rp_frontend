"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  onNavigate?: () => void;
}

export function NavItem({ href, label, icon: Icon, onNavigate }: NavItemProps) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-signal-cyan/10 text-signal-cyan"
          : "text-ink-300 hover:bg-base-800 hover:text-ink-100"
      }`}
    >
      <Icon
        size={17}
        strokeWidth={2}
        className={active ? "text-signal-cyan" : "text-ink-500 group-hover:text-ink-100"}
      />
      <span className="truncate">{label}</span>
      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-signal-cyan" />}
    </Link>
  );
}
