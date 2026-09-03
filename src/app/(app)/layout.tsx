import { Sidebar } from "@/components/sidebar/Sidebar";
import { ModuleGuard } from "@/components/layout/ModuleGuard";
import { SidebarProvider } from "@/context/SidebarContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-base-950">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <ModuleGuard>{children}</ModuleGuard>
        </div>
      </div>
    </SidebarProvider>
  );
}
