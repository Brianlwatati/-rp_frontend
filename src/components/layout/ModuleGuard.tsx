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
  const { user, isCompanyAdmin, permissions, loading } = useAuth();
  const requiredModule = moduleFromPath(pathname);
  const canAccess =
    !requiredModule ||
    isCompanyAdmin ||
    permissions?.some(
      (permission) => normalizeModule(permission.module) === requiredModule,
    );

  useEffect(() => {
    if (!loading && !user)
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (!loading && permissions && requiredModule && !canAccess)
      router.replace("/dashboard");
  }, [canAccess, loading, pathname, permissions, requiredModule, router, user]);

  if (
    loading ||
    (requiredModule && !permissions) ||
    (requiredModule && !canAccess)
  )
    return null;
  return <>{children}</>;
}
