"use client";

import { useEffect, useMemo, useState } from "react";
import { UserCog, X } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { RolesTabs } from "@/components/roles/RolesTabs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Field, inputClass } from "@/components/ui/FormField";
import { useAuth } from "@/context/AuthContext";
import { api, authApi, describeApiError } from "@/lib/api";
import type {
  ErpBranch,
  ErpRole,
  ErpRoleAssignment,
  IasCompanyUser,
} from "@/lib/types";

interface UserAssignments {
  [userId: number]: ErpRoleAssignment[];
}

const FALLBACK_USERS: IasCompanyUser[] = [];

export default function RoleAssignmentPage() {
  const { user } = useAuth();
  const companyId = Number(user?.companyId ?? user?.company?.id);
  const [users, setUsers] = useState<IasCompanyUser[]>(FALLBACK_USERS);
  const [roles, setRoles] = useState<ErpRole[]>([]);
  const [branches, setBranches] = useState<ErpBranch[]>([]);
  const [assignments, setAssignments] = useState<UserAssignments>({});
  const [roleByUser, setRoleByUser] = useState<Record<number, string>>({});
  const [branchByUser, setBranchByUser] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [savingUser, setSavingUser] = useState<number | null>(null);

  useEffect(() => {
    if (!companyId) return;

    setLoading(true);
    setError(null);
    Promise.all([
      authApi.get<IasCompanyUser[]>(
        `/companies/${companyId}/users?page=1&pageSize=25`,
      ),
      api.get<ErpRole[]>("/roles"),
      api.get<ErpBranch[]>("/branches"),
    ])
      .then(async ([companyUsers, availableRoles, availableBranches]) => {
        setUsers(companyUsers);
        setRoles(availableRoles);
        setBranches(availableBranches);
        const entries = await Promise.all(
          companyUsers.map(
            async (companyUser) =>
              [
                companyUser.userId,
                await api.get<ErpRoleAssignment[]>(
                  `/role-assignments/user/${companyUser.userId}`,
                ),
              ] as const,
          ),
        );
        setAssignments(Object.fromEntries(entries));
      })
      .catch((err) =>
        setError(
          describeApiError(err, "Couldn't load users and role options."),
        ),
      )
      .finally(() => setLoading(false));
  }, [companyId]);

  const roleNames = useMemo(
    () => new Map(roles.map((role) => [role.id, role.name])),
    [roles],
  );
  const branchNames = useMemo(
    () => new Map(branches.map((branch) => [branch.id, branch.name])),
    [branches],
  );

  async function assign(userId: number) {
    const roleId = Number(roleByUser[userId]);
    const branchId = branchByUser[userId] ? Number(branchByUser[userId]) : null;
    if (!roleId) return;

    setActionError(null);
    setSavingUser(userId);
    try {
      const assignment = await api.post<ErpRoleAssignment>(
        "/role-assignments",
        {
          iasUserId: userId,
          roleId,
          branchId,
        },
      );
      setAssignments((current) => ({
        ...current,
        [userId]: [
          assignment,
          ...(current[userId] ?? []).filter(
            (item) => item.id !== assignment.id,
          ),
        ],
      }));
      setRoleByUser((current) => ({ ...current, [userId]: "" }));
      setBranchByUser((current) => ({ ...current, [userId]: "" }));
    } catch (err) {
      setActionError(describeApiError(err, "Couldn't assign this role."));
    } finally {
      setSavingUser(null);
    }
  }

  async function revoke(userId: number, assignmentId: number) {
    setActionError(null);
    try {
      await api.delete(`/role-assignments/${assignmentId}`);
      setAssignments((current) => ({
        ...current,
        [userId]: (current[userId] ?? []).filter(
          (assignment) => assignment.id !== assignmentId,
        ),
      }));
    } catch (err) {
      setActionError(describeApiError(err, "Couldn't revoke this assignment."));
    }
  }

  const columns: Column<IasCompanyUser>[] = [
    {
      header: "User",
      accessor: (companyUser) => (
        <div>
          <p className="text-ink-100">
            {companyUser.firstName} {companyUser.lastName}
          </p>
          <p className="text-xs text-ink-500">{companyUser.email}</p>
        </div>
      ),
    },
    {
      header: "IAS role",
      accessor: (companyUser) => (
        <Badge tone={companyUser.status === "ACTIVE" ? "green" : "neutral"}>
          {companyUser.roleName ?? companyUser.roleCode ?? "No role"}
        </Badge>
      ),
    },
    {
      header: "ERP assignments",
      accessor: (companyUser) => (
        <div className="flex flex-wrap gap-1.5 max-w-sm">
          {(assignments[companyUser.userId] ?? []).map((assignment) => (
            <span
              key={assignment.id}
              className="inline-flex items-center gap-1 rounded-md border border-base-600 bg-base-800 px-2 py-1 text-xs text-ink-300"
            >
              {roleNames.get(assignment.roleId) ?? `Role #${assignment.roleId}`}{" "}
              ·{" "}
              {assignment.branchId
                ? (branchNames.get(assignment.branchId) ??
                  `Branch #${assignment.branchId}`)
                : "All branches"}
              <button
                type="button"
                onClick={() => revoke(companyUser.userId, assignment.id)}
                aria-label="Revoke assignment"
                className="text-ink-500 hover:text-signal-red"
              >
                <X size={13} />
              </button>
            </span>
          ))}
          {(assignments[companyUser.userId] ?? []).length === 0 && (
            <span className="text-ink-500">None</span>
          )}
        </div>
      ),
    },
    {
      header: "Assign",
      accessor: (companyUser) => (
        <div className="flex items-end gap-2 min-w-[390px]">
          <Field label="Role">
            <select
              value={roleByUser[companyUser.userId] ?? ""}
              onChange={(event) =>
                setRoleByUser((current) => ({
                  ...current,
                  [companyUser.userId]: event.target.value,
                }))
              }
              className={inputClass}
            >
              <option value="">Select role…</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Branch">
            <select
              value={branchByUser[companyUser.userId] ?? ""}
              onChange={(event) =>
                setBranchByUser((current) => ({
                  ...current,
                  [companyUser.userId]: event.target.value,
                }))
              }
              className={inputClass}
            >
              <option value="">All branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </Field>
          <Button
            type="button"
            disabled={
              !roleByUser[companyUser.userId] ||
              savingUser === companyUser.userId
            }
            onClick={() => assign(companyUser.userId)}
          >
            <UserCog size={15} />
            {savingUser === companyUser.userId ? "Saving…" : "Assign"}
          </Button>
        </div>
      ),
      width: "440px",
    },
  ];

  return (
    <>
      <Topbar
        title="Role assignment"
        description="Assign ERP roles and branch access to users in this company."
      />
      <RolesTabs />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {error && (
          <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {actionError && (
          <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2">
            {actionError}
          </p>
        )}
        {!companyId && (
          <p className="text-sm text-signal-amber bg-signal-amber/10 border border-signal-amber/30 rounded-lg px-3 py-2">
            Your company could not be identified.
          </p>
        )}
        {loading ? (
          <p className="text-sm text-ink-500">Loading company users…</p>
        ) : (
          <DataTable
            columns={columns}
            rows={users}
            rowKey={(companyUser) => String(companyUser.userId)}
            emptyLabel="No users found for this company."
          />
        )}
      </div>
    </>
  );
}
