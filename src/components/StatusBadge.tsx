import { PROJECT_STATUSES, type ProjectStatus } from "@/lib/types";

export default function StatusBadge({ status }: { status: ProjectStatus | string }) {
  let colors = "bg-slate-500/10 text-slate-400 border-slate-500/20";
  let pulse = false;

  switch (status) {
    case "Planned":
      colors = "bg-slate-500/10 text-slate-300 border-slate-500/20";
      break;
    case "In Progress":
      colors = "bg-blue-500/10 text-blue-400 border-blue-500/20";
      pulse = true;
      break;
    case "At Risk":
      colors = "bg-orange-500/10 text-orange-400 border-orange-500/20";
      pulse = true;
      break;
    case "Delayed":
      colors = "bg-rose-500/10 text-rose-400 border-rose-500/20";
      break;
    case "Completed":
      colors = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${colors}`}>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colors.split(' ')[1].replace('text-', 'bg-')}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${colors.split(' ')[1].replace('text-', 'bg-')}`}></span>
        </span>
      )}
      {!pulse && (
        <span className={`h-1.5 w-1.5 rounded-full ${colors.split(' ')[1].replace('text-', 'bg-')}`} />
      )}
      {status}
    </span>
  );
}
