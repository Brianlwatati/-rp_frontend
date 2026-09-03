"use client";

import {
  LayoutDashboard,
  ShieldCheck,
  Building2,
  Boxes,
  ClipboardList,
  Truck,
  Contact,
  Receipt,
  Users2,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { CompanyBadge } from "./CompanyBadge";
import { NavItem } from "./NavItem";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";

const PRIMARY_NAV = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    name: "reporting",
  },
  { href: "/inventory", label: "Inventory", icon: Boxes, name: "inventory" },
  { href: "/sales", label: "Sales", icon: ClipboardList, name: "sales" },
  { href: "/purchasing", label: "Purchasing", icon: Truck, name: "purchasing" },
  { href: "/contacts", label: "Contacts", icon: Contact, name: "contacts" },
  { href: "/finance", label: "Finance", icon: Receipt, name: "finance" },
];

const FINANCE_HR_NAV = [{ href: "/hr", label: "HR", icon: Users2, name: "hr" }];

const ACCESS_NAV = [
  { href: "/roles", label: "Roles", icon: ShieldCheck, name: "access" },
  { href: "/branches", label: "Branches", icon: Building2, name: "access" },
];

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const { user, permissions, logout } = useAuth();
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "OP";
  const hasModuleAccess = (module: string) =>
    permissions?.some(
      (permission) =>
        permission.module.toLowerCase().replace(/[\s_-]/g, "") === module,
    ) ?? false;

  const primaryNav = PRIMARY_NAV.filter((item) => hasModuleAccess(item.name));
  const financeHrNav = FINANCE_HR_NAV.filter((item) =>
    hasModuleAccess(item.name),
  );
  const accessNav = ACCESS_NAV.filter((item) => hasModuleAccess(item.name));

  return (
    <>
      <CompanyBadge />

      <nav className="mt-6 flex-1 space-y-6 overflow-y-auto">
        <div>
          <p className="label-eyebrow px-3 mb-2">Operations</p>
          <div className="space-y-0.5">
            {primaryNav.map((item) => (
              <NavItem key={item.href} {...item} onNavigate={onNavigate} />
            ))}
          </div>
        </div>

        <div>
          <p className="label-eyebrow px-3 mb-2"> HR</p>
          <div className="space-y-0.5">
            {financeHrNav.map((item) => (
              <NavItem key={item.href} {...item} onNavigate={onNavigate} />
            ))}
          </div>
        </div>

        <div>
          <p className="label-eyebrow px-3 mb-2">Access</p>
          <div className="space-y-0.5">
            {accessNav.map((item) => (
              <NavItem key={item.href} {...item} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </nav>

      <div className="border-t border-base-600/60 pt-3 mt-3">
        <NavItem
          href="/settings"
          label="Settings"
          icon={Settings}
          onNavigate={onNavigate}
        />

        <div className="mt-3 flex items-center gap-2.5 rounded-lg px-3 py-2">
          <div className="h-8 w-8 shrink-0 rounded-full bg-base-700 border border-base-600 flex items-center justify-center">
            <span className="text-[11px] font-mono text-ink-300">
              {initials}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-ink-100">
              {user?.email ?? "Signed-in operator"}
            </p>
            <p className="truncate text-[11px] text-ink-500 font-mono">
              {user?.roleName ?? "Operator"}
            </p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="text-ink-500 hover:text-signal-red transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  );
}

function Brand() {
  return (
    <div className="mb-4 flex items-center gap-2 px-1">
      <div className="h-7 w-7 rounded-md bg-signal-cyan/15 border border-signal-cyan/40 flex items-center justify-center">
        <span className="font-display font-bold text-signal-cyan text-xs">
          IA
        </span>
      </div>
      <span className="font-display text-sm font-semibold tracking-tight text-ink-100">
        IAS Console
      </span>
    </div>
  );
}

export function Sidebar() {
  const { mobileOpen, closeMobile } = useSidebar();

  return (
    <>
      {/* Desktop rail */}
      <aside className="no-print hidden md:flex w-64 shrink-0 flex-col border-r border-base-600/60 bg-base-900 px-3.5 py-4">
        <Brand />
        <SidebarBody />
      </aside>

      {/* Mobile backdrop */}
      <div
        className={`no-print md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <aside
        className={`no-print md:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] flex flex-col border-r border-base-600/60 bg-base-900 px-3.5 py-4 transition-transform duration-200 ease-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-signal-cyan/15 border border-signal-cyan/40 flex items-center justify-center">
              <span className="font-display font-bold text-signal-cyan text-xs">
                IA
              </span>
            </div>
            <span className="font-display text-sm font-semibold tracking-tight text-ink-100">
              IAS Console
            </span>
          </div>
          <button
            onClick={closeMobile}
            aria-label="Close menu"
            className="text-ink-500 hover:text-ink-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <SidebarBody onNavigate={closeMobile} />
      </aside>
    </>
  );
}
