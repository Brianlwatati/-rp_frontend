import { HrDirectoryPage } from "@/components/hr/HrDirectoryPage";

export default function DepartmentsPage() {
  return (
    <HrDirectoryPage
      kind="departments"
      title="Departments"
      description="Define the teams employees belong to."
      singular="department"
    />
  );
}
