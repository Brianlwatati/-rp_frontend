import Link from "next/link";
import { BriefcaseBusiness, Building2, UserRound } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { HrTabs } from "@/components/hr/HrTabs";

export default function HrIndexPage() {
  const tiles = [
    {
      href: "/hr/employees",
      label: "Employees",
      description: "Manage people, payroll details, and employee records.",
      icon: UserRound,
    },
    {
      href: "/hr/departments",
      label: "Departments",
      description: "Create and maintain the teams in your organization.",
      icon: Building2,
    },
    {
      href: "/hr/job-titles",
      label: "Job titles",
      description: "Keep the roles available for employee assignments up to date.",
      icon: BriefcaseBusiness,
    },
  ];

  return (
    <>
      <Topbar title="Human resources" description="Organize your people and workforce structure." />
      <HrTabs />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl">
          {tiles.map(({ href, label, description, icon: Icon }) => (
            <Link key={href} href={href} className="panel p-5 group hover:border-signal-cyan/60 transition-colors">
              <div className="flex items-center justify-between">
                <Icon size={20} className="text-signal-cyan" />
                <span className="text-ink-500 group-hover:text-signal-cyan transition-colors">→</span>
              </div>
              <h2 className="mt-8 font-display text-lg font-semibold text-ink-100">{label}</h2>
              <p className="mt-2 text-sm leading-6 text-ink-500">{description}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
