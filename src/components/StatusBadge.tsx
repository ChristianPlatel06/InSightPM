import type { ProjectStatus } from "@/lib/types";

const styles: Record<ProjectStatus, string> = {
  Planned: "bg-slate-800 text-slate-200",
  "In Progress": "bg-sky-500/15 text-sky-300",
  "At Risk": "bg-amber-500/15 text-amber-300",
  Delayed: "bg-rose-500/15 text-rose-300",
  Completed: "bg-emerald-500/15 text-emerald-300",
};

export default function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}
