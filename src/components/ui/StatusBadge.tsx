import { statusColors, statusLabels } from "@/lib/constants";
import { PermissionStatus } from "@/types";

export function StatusBadge({ status }: { status: PermissionStatus }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[status]}`}>{statusLabels[status]}</span>;
}
