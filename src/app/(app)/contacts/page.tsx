"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserPlus, Pencil } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import type { Contact } from "@/lib/types";

const FALLBACK_CONTACTS: Contact[] = [
  {
    id: 1,
    iasCompanyId: 2,
    contactType: "CUSTOMER",
    name: "Harbor Logistics",
    phone: "+254700000001",
    email: "ap@harborlogistics.com",
    address: null,
    taxId: null,
    creditLimit: "5000.00",
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    iasCompanyId: 2,
    contactType: "SUPPLIER",
    name: "Nairobi Steel Co.",
    phone: "+254700000002",
    email: "sales@nairobisteel.co.ke",
    address: null,
    taxId: "P000111222A",
    creditLimit: null,
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

const TYPE_TONE = {
  CUSTOMER: "green",
  SUPPLIER: "amber",
  BOTH: "cyan",
} as const;

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(FALLBACK_CONTACTS);

  useEffect(() => {
    api
      .get<Contact[]>("/contacts")
      .then(setContacts)
      .catch(() => setContacts(FALLBACK_CONTACTS));
  }, []);

  const columns: Column<Contact>[] = [
    {
      header: "Name",
      accessor: (c) => <span className="text-ink-100">{c.name}</span>,
    },
    {
      header: "Type",
      accessor: (c) => (
        <Badge tone={TYPE_TONE[c.contactType]}>{c.contactType}</Badge>
      ),
    },
    { header: "Email", accessor: (c) => c.email ?? "—" },
    { header: "Phone", accessor: (c) => c.phone ?? "—" },
    {
      header: "Status",
      accessor: (c) => (
        <Badge tone={c.status === "ACTIVE" ? "green" : "neutral"}>
          {c.status}
        </Badge>
      ),
    },
    {
      header: "",
      accessor: (c) => (
        <Link
          href={`/contacts/${c.id}/edit`}
          className="inline-flex items-center gap-1.5 text-signal-cyan hover:text-signal-cyan/80 text-xs"
        >
          <Pencil size={13} />
          Edit
        </Link>
      ),
      align: "right",
      width: "80px",
    },
  ];

  return (
    <>
      <Topbar
        title="Contacts"
        description="Customers and suppliers this company deals with."
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="flex justify-end">
          <Link
            href="/contacts/new"
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium bg-signal-cyan text-base-950 hover:bg-signal-cyan/90 transition-colors"
          >
            <UserPlus size={15} />
            New contact
          </Link>
        </div>
        <DataTable
          columns={columns}
          rows={contacts}
          rowKey={(c) => String(c.id)}
        />
      </div>
    </>
  );
}
