import Link from "next/link";
import { ArrowUpFromLine, Banknote, FileText, PackagePlus } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { PurchasingTabs } from "@/components/purchasing/PurchasingTabs";

const tiles = [
  {
    href: "/purchasing/purchasing",
    label: "Purchase orders",
    description:
      "Create and manage supplier orders from draft through receipt.",
    icon: PackagePlus,
  },
  {
    href: "/purchasing/bills",
    label: "Bills",
    description: "Review supplier bills generated from received purchases.",
    icon: FileText,
  },
  {
    href: "/purchasing/payables",
    label: "Payables",
    description: "Monitor supplier balances and upcoming obligations.",
    icon: ArrowUpFromLine,
  },
  {
    href: "/purchasing/supplier-payments/new",
    label: "Pay supplier",
    description: "Record payments made against supplier bills.",
    icon: Banknote,
  },
];

export default function PurchasingIndexPage() {
  return (
    <>
      <Topbar
        title="Purchasing"
        description="Manage supplier orders, bills, and payments."
      />
      <PurchasingTabs />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl">
          {tiles.map(({ href, label, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="panel p-5 group hover:border-signal-cyan/60 transition-colors"
            >
              <div className="flex items-center justify-between">
                <Icon size={20} className="text-signal-cyan" />
                <span className="text-ink-500 group-hover:text-signal-cyan transition-colors">
                  →
                </span>
              </div>
              <h2 className="mt-8 font-display text-lg font-semibold text-ink-100">
                {label}
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink-500">
                {description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
