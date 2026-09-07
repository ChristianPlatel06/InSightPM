import Link from "next/link";
import ProgressBar from "@/components/ProgressBar";
import StatusBadge from "@/components/StatusBadge";
import type { Project } from "@/lib/types";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="block rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700 hover:bg-slate-900/80"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {project.name || "Untitled project"}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-400">
            {project.description || "No description yet."}
          </p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
          <span>{project.owner || "Unassigned"}</span>
          <span>{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} />
      </div>
    </Link>
  );
}
