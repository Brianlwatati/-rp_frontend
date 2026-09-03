import { HrDirectoryPage } from "@/components/hr/HrDirectoryPage";

export default function JobTitlesPage() {
  return (
    <HrDirectoryPage
      kind="job-titles"
      title="Job titles"
      description="Define the roles available for employee assignments."
      singular="job title"
    />
  );
}
