"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProjectCard from "@/components/ProjectCard";
import { fetchProjects } from "@/lib/api";
import { PROJECT_STATUSES, type Project, type ProjectStatus } from "@/lib/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"All" | ProjectStatus>("All");
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesStatus = status === "All" || project.status === status;
      const matchesQuery =
        !q ||
        project.name.toLowerCase().includes(q) ||
        project.owner.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [projects, query, status]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="mt-2 text-slate-400">All tracked work stored in Firestore.</p>
        </div>
        <Link
          href="/create-project"
          className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-400"
        >
          New project
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, owner, or description"
          className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-sky-500 sm:col-span-2"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "All" | ProjectStatus)}
          className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-sky-500"
        >
          <option value="All">All statuses</option>
          {PROJECT_STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

      {loading ? (
        <p className="mt-6 text-slate-400">Loading projects…</p>
      ) : filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-700 p-8 text-slate-400">
          No matching projects.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
