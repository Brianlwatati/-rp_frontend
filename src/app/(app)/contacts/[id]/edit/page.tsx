"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Field, inputClass } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { api, describeApiError } from "@/lib/api";
import type { Contact } from "@/lib/types";

const EMPTY_FORM = { name: "", phone: "", email: "", address: "", taxId: "", creditLimit: "" };

export default function EditContactPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [contactType, setContactType] = useState<Contact["contactType"] | null>(null);
  const [status, setStatus] = useState<Contact["status"] | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // There's no GET /contacts/:id — the list endpoint is the only read
    // path, so it's fetched and filtered client-side.
    api
      .get<Contact[]>("/contacts")
      .then((contacts) => {
        const contact = contacts.find((c) => String(c.id) === params.id);
        if (!contact) {
          setLoadError("Contact not found.");
          return;
        }
        setContactType(contact.contactType);
        setStatus(contact.status);
        setForm({
          name: contact.name,
          phone: contact.phone ?? "",
          email: contact.email ?? "",
          address: contact.address ?? "",
          taxId: contact.taxId ?? "",
          creditLimit: contact.creditLimit ?? "",
        });
      })
      .catch((err) => setLoadError(describeApiError(err, "Couldn't load this contact.")))
      .finally(() => setLoading(false));
  }, [params.id]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      // PATCH /contacts/:id — contactType and status aren't accepted here.
      await api.patch<Contact>(`/contacts/${params.id}`, {
        name: form.name,
        phone: form.phone || undefined,
        email: form.email || undefined,
        address: form.address || undefined,
        taxId: form.taxId || undefined,
        creditLimit: form.creditLimit ? Number(form.creditLimit) : undefined,
      });
      router.push("/contacts");
    } catch (err) {
      setError(describeApiError(err, "Couldn't save these changes."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Topbar title="Edit contact" description={contactType ? `${contactType} · Contact #${params.id}` : `Contact #${params.id}`} />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {loading ? (
          <p className="text-sm text-ink-500">Loading contact…</p>
        ) : loadError && !contactType ? (
          <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2 max-w-xl">
            {loadError}
          </p>
        ) : (
          <form onSubmit={onSubmit} className="max-w-xl panel p-6 space-y-5">
            {status && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-500">Status</span>
                <Badge tone={status === "ACTIVE" ? "green" : "neutral"}>{status}</Badge>
              </div>
            )}

            <Field label="Name" required>
              <input
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Phone">
                <input
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Address">
              <textarea
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                rows={2}
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Tax ID">
                <input
                  value={form.taxId}
                  onChange={(e) => update("taxId", e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </Field>
              <Field label="Credit limit">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.creditLimit}
                  onChange={(e) => update("creditLimit", e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </Field>
            </div>

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
                href="/contacts"
                className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium bg-base-700 text-ink-100 border border-base-600 hover:bg-base-700/70 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
