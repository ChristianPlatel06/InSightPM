"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProjectCard from "@/components/ProjectCard";
import { fetchProjects } from "@/lib/api";
import type { Project } from "@/lib/types";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Could not load projects");
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const active = projects.filter((p) => p.status === "In Progress" || p.status === "At Risk").length;
    const delayed = projects.filter((p) => p.status === "Delayed").length;
    const completed = projects.filter((p) => p.status === "Completed").length;
    const avg =
      projects.length === 0
        ? 0
        : Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length);
    return { total: projects.length, active, delayed, completed, avg };
  }, [projects]);

  const recent = projects.slice(0, 6);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-sky-300">AI-powered monitoring</p>
          <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-slate-400">
            Track delivery risk, progress, and status across every project in Firestore.
          </p>
        </div>
        <Link
          href="/create-project"
          className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-400"
        >
          New project
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Projects", value: stats.total },
          { label: "Active", value: stats.active },
          { label: "Delayed", value: stats.delayed },
          { label: "Avg progress", value: `${stats.avg}%` },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-sm text-slate-400">{item.label}</h2>
            <p className="mt-2 text-3xl font-semibold text-white">{loading ? "—" : item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Recent projects</h2>
        <Link href="/projects" className="text-sm text-sky-300 hover:text-sky-200">
          View all
        </Link>
      </div>

      {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

      {loading ? (
        <p className="mt-4 text-slate-400">Loading projects…</p>
      ) : recent.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-700 p-8 text-slate-400">
          No projects yet. Create your first one to populate the dashboard.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {recent.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
