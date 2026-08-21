"use client";

import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <>
      <Topbar title="Settings" description="Your account and this workspace's defaults." />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-2xl">
        <div className="panel p-6">
          <p className="label-eyebrow mb-4">Account</p>
          <div className="grid grid-cols-[120px_1fr] gap-y-3 text-sm">
            <span className="text-ink-500">Email</span>
            <span className="text-ink-100 font-mono break-all">{user?.email ?? "—"}</span>
            <span className="text-ink-500">Role</span>
            <span className="text-ink-100">
              {user?.roleName ?? "—"}
              {user?.roleCode && <span className="text-ink-500 font-mono"> · {user.roleCode}</span>}
            </span>
            <span className="text-ink-500">Scope</span>
            <span className="text-ink-100 font-mono text-xs">{user?.roleScopeKey ?? "—"}</span>
            <span className="text-ink-500">Company</span>
            <span className="text-ink-100">{user?.company?.name ?? "—"}</span>
          </div>
        </div>

        <div className="panel p-6">
          <p className="label-eyebrow mb-2">Session</p>
          <p className="text-sm text-ink-300 mb-4">
            Signing out revokes this browser&apos;s token. You&apos;ll need to sign in again to
            reach any workspace.
          </p>
          <Button variant="secondary" onClick={logout}>
            Sign out
          </Button>
        </div>
      </div>
    </>
  );
}
