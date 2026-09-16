import Link from "next/link";
import {
  ArrowDownToLine,
  Receipt,
  ShoppingCart,
  WalletCards,
} from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { SalesTabs } from "@/components/sales/SalesTabs";

export default function SalesIndexPage() {
  const tiles = [
    {
      href: "/finance/invoices",
      label: "Invoices",
      description: "Create and manage customer invoices from confirmed sales.",
      icon: Receipt,
    },
    {
      href: "/finance/receivables",
      label: "Receivables",
      description: "Track outstanding customer balances and incoming payments.",
      icon: ArrowDownToLine,
    },

    {
      href: "/sales/payments/new",
      label: "Record payment",
      description: "Allocate a customer payment across one or more invoices.",
      icon: WalletCards,
    },
  ];

  return (
    <>
      <Topbar
        title="Sales"
        description="Manage customer orders, invoices, and incoming payments."
      />
      <SalesTabs />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl">
          <Link
            href="/sales"
            className="panel p-5 group hover:border-signal-cyan/60 transition-colors"
          >
            <div className="flex items-center justify-between">
              <ShoppingCart size={20} className="text-signal-cyan" />
              <span className="text-ink-500 group-hover:text-signal-cyan transition-colors">
                →
              </span>
            </div>
            <h2 className="mt-8 font-display text-lg font-semibold text-ink-100">
              Sales orders
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink-500">
              Create and manage customer orders from draft through shipment.
            </p>
          </Link>
        </div>
      </div>
    </>
  );
}
