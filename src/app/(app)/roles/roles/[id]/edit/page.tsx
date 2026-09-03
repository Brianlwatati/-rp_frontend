"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Field, inputClass } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { api, describeApiError } from "@/lib/api";
import type { ErpRole, ErpPermission } from "@/lib/types";

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [code, setCode] = useState("");
  const [form, setForm] = useState({
    name: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    isDefault: false,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Permission matrix — the full catalog (GET /permissions) crossed with
  // this role's currently-granted subset (GET /roles/:id/permissions).
  const [catalog, setCatalog] = useState<ErpPermission[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [permissionsSaved, setPermissionsSaved] = useState(false);

  useEffect(() => {
    api
      .get<ErpRole>(`/roles/${params.id}`)
      .then((role) => {
        setCode(role.code);
        setForm({
          name: role.name,
          status: role.status,
          isDefault: role.isDefault,
        });
      })
      .catch((err) =>
        setLoadError(describeApiError(err, "Couldn't load this role.")),
      )
      .finally(() => setLoading(false));

    Promise.all([
      api.get<ErpPermission[]>("/permissions"),
      api.get<ErpPermission[]>(`/roles/${params.id}/permissions`),
    ])
      .then(([all, granted]) => {
        setCatalog(all);
        setSelected(new Set(granted.map((p) => p.id)));
      })
      .catch((err) =>
        setPermissionsError(
          describeApiError(err, "Couldn't load permissions."),
        ),
      )
      .finally(() => setPermissionsLoading(false));
  }, [params.id]);

  function update<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      // PATCH /roles/:id — code is immutable, so it's not sent.
      await api.patch<ErpRole>(`/roles/${params.id}`, {
        name: form.name,
        status: form.status,
        isDefault: form.isDefault,
      });
      router.push("/roles");
    } catch (err) {
      setError(describeApiError(err, "Couldn't save these changes."));
    } finally {
      setSubmitting(false);
    }
  }

  function toggle(id: number) {
    setPermissionsSaved(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleModule(
    modulePermissions: ErpPermission[],
    allChecked: boolean,
  ) {
    setPermissionsSaved(false);
    setSelected((prev) => {
      const next = new Set(prev);
      for (const p of modulePermissions) {
        if (allChecked) next.delete(p.id);
        else next.add(p.id);
      }
      return next;
    });
  }

  async function savePermissions() {
    setPermissionsError(null);
    setPermissionsSaved(false);
    setSavingPermissions(true);
    try {
      const granted = await api.put<ErpPermission[]>(
        `/roles/${params.id}/permissions`,
        {
          permissionIds: Array.from(selected),
        },
      );
      setSelected(new Set(granted.map((p) => p.id)));
      setPermissionsSaved(true);
    } catch (err) {
      setPermissionsError(describeApiError(err, "Couldn't save permissions."));
    } finally {
      setSavingPermissions(false);
    }
  }

  const grouped = catalog.reduce<Record<string, ErpPermission[]>>((acc, p) => {
    (acc[p.module] ??= []).push(p);
    return acc;
  }, {});

  return (
    <>
      <Topbar
        title="Edit role"
        description={code ? `Code ${code}` : `Role #${params.id}`}
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {loading ? (
          <p className="text-sm text-ink-500">Loading role…</p>
        ) : (
          <form onSubmit={onSubmit} className="max-w-full panel p-6 space-y-5">
            {loadError && (
              <p className="text-sm text-signal-amber bg-signal-amber/10 border border-signal-amber/30 rounded-lg px-3 py-2">
                {loadError}
              </p>
            )}

            <Field label="Code" hint="Codes can't be changed after creation.">
              <input
                disabled
                value={code}
                className={`${inputClass} font-mono`}
              />
            </Field>

            <Field label="Name" required>
              <input
                required
                minLength={2}
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) =>
                  update("status", e.target.value as "ACTIVE" | "INACTIVE")
                }
                className={inputClass}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </Field>

            <label className="flex items-center gap-2.5 text-sm text-ink-300">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => update("isDefault", e.target.checked)}
                className="h-4 w-4 rounded border-base-600 bg-base-800 accent-signal-cyan"
              />
              Assign this role to new users by default
            </label>

            {error && (
              <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving…" : "Save changes"}
              </Button>
              <Link
                href="/roles"
                className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium bg-base-700 text-ink-100 border border-base-600 hover:bg-base-700/70 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        )}

        <div className="max-w-full panel p-6 space-y-5">
          <div>
            <p className="label-eyebrow mb-1">Permissions</p>
            <p className="text-sm text-ink-500">
              What this role can see and do, grouped by module.
            </p>
          </div>

          {permissionsLoading ? (
            <p className="text-sm text-ink-500">Loading permissions…</p>
          ) : (
            <>
              <div className="space-y-4">
                {Object.entries(grouped).map(([module, permissions]) => {
                  const allChecked = permissions.every((p) =>
                    selected.has(p.id),
                  );
                  return (
                    <div
                      key={module}
                      className="border border-base-600/60 rounded-lg overflow-hidden"
                    >
                      <label className="flex items-center gap-2.5 px-3.5 py-2.5 bg-base-700/30 border-b border-base-600/60 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allChecked}
                          onChange={() => toggleModule(permissions, allChecked)}
                          className="h-4 w-4 rounded border-base-600 bg-base-800 accent-signal-cyan"
                        />
                        <span className="font-mono text-ink-100">{module}</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 px-3.5 py-3">
                        {permissions.map((p) => (
                          <label
                            key={p.id}
                            className="flex items-center gap-2.5 text-sm text-ink-300 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selected.has(p.id)}
                              onChange={() => toggle(p.id)}
                              className="h-4 w-4 rounded border-base-600 bg-base-800 accent-signal-cyan"
                            />
                            {p.action}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {catalog.length === 0 && (
                  <p className="text-sm text-ink-500">
                    No permissions defined in the catalog yet.
                  </p>
                )}
              </div>

              {permissionsError && (
                <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2">
                  {permissionsError}
                </p>
              )}

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  onClick={savePermissions}
                  disabled={savingPermissions}
                >
                  {savingPermissions ? "Saving…" : "Save permissions"}
                </Button>
                {permissionsSaved && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-signal-green">
                    <Check size={14} />
                    Saved
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
