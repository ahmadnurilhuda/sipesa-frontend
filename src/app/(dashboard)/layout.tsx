import { DashboardShell } from "@/components/layout/DashboardShell";
import { RoleGate } from "@/components/layout/RoleGate";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell>
      <RoleGate>{children}</RoleGate>
    </DashboardShell>
  );
}
