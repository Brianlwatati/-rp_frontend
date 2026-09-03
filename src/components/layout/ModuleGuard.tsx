"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const MODULE_PATHS: Record<string, string> = {
  inventory: "inventory",
  sales: "sales",
  purchasing: "purchasing",
  contacts: "contacts",
  finance: "finance",
  hr: "hr",
  roles: "access",
  branches: "access",
  dashboard: "reporting",
};

function moduleFromPath(pathname: string) {
  const segment = pathname.split("/")[1];
  return segment ? MODULE_PATHS[segment] : undefined;
}

function normalizeModule(module: string) {
  return module.toLowerCase().replace(/[\s_-]/g, "");
}

export function ModuleGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, permissions, loading } = useAuth();
  const module = moduleFromPath(pathname);
  const canAccess =
    !module ||
    permissions?.some(
      (permission) => normalizeModule(permission.module) === module,
    );

  useEffect(() => {
    if (!loading && !user)
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (!loading && permissions && module && !canAccess)
      router.replace("/dashboard");
  }, [canAccess, loading, module, pathname, permissions, router, user]);

  if (loading || (module && !permissions) || (module && !canAccess))
    return null;
  return <>{children}</>;
}
