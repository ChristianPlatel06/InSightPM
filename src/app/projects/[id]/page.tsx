"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProgressBar from "@/components/ProgressBar";
import StatusBadge from "@/components/StatusBadge";
import { deleteProject, fetchProject, patchProject } from "@/lib/api";
import { PROJECT_STATUSES, type Project, type ProjectStatus } from "@/lib/types";

export default function ProjectDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchProject(id)
      .then(setProject)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Could not load project");
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function save(partial: Partial<Project>) {
    if (!id) return;
    setSaving(true);
    setError("");
    try {
      const updated = await patchProject(id, partial);
      setProject(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not save project");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!id || !confirm("Delete this project?")) return;
    try {
      await deleteProject(id);
      router.push("/projects");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not delete project");
    }
  }

  if (loading) {
    return <p className="text-slate-400">Loading project…</p>;
  }

  if (!project) {
    return (
      <div>
        <p className="text-rose-300">{error || "Project not found."}</p>
        <Link href="/projects" className="mt-4 inline-block text-sky-300">
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/projects" className="text-sm text-sky-300 hover:text-sky-200">
            ← Projects
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-white">{project.name}</h1>
          <p className="mt-2 max-w-2xl text-slate-400">
            {project.description || "No description yet."}
          </p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Owner</p>
          <p className="mt-2 text-lg text-white">{project.owner || "Unassigned"}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Due date</p>
          <p className="mt-2 text-lg text-white">{project.dueDate || "Not set"}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Progress</p>
          <p className="mt-2 text-lg text-white">{project.progress}%</p>
          <div className="mt-3">
            <ProgressBar value={project.progress} />
          </div>
        </div>
      </div>

      <form
        className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          save({
            name: project.name,
            description: project.description,
            owner: project.owner,
            status: project.status,
            progress: project.progress,
            dueDate: project.dueDate,
          });
        }}
      >
        <h2 className="text-lg font-semibold text-white">Update project</h2>

        <label className="block">
          <span className="mb-1.5 block text-sm text-slate-300">Name</span>
          <input
            value={project.name}
            onChange={(e) => setProject({ ...project, name: e.target.value })}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-500"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm text-slate-300">Description</span>
          <textarea
            value={project.description}
            onChange={(e) => setProject({ ...project, description: e.target.value })}
            rows={4}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-500"
          />
        </label>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm text-slate-300">Owner</span>
            <input
              value={project.owner}
              onChange={(e) => setProject({ ...project, owner: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-500"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-slate-300">Due date</span>
            <input
              type="date"
              value={project.dueDate ?? ""}
              onChange={(e) => setProject({ ...project, dueDate: e.target.value || null })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-500"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm text-slate-300">Status</span>
            <select
              value={project.status}
              onChange={(e) =>
                setProject({ ...project, status: e.target.value as ProjectStatus })
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-500"
            >
              {PROJECT_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-slate-300">
              Progress ({project.progress}%)
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={project.progress}
              onChange={(e) =>
                setProject({ ...project, progress: Number(e.target.value) })
              }
              className="mt-3 w-full"
            />
          </label>
        </div>

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-sky-500 px-4 py-2.5 font-medium text-white hover:bg-sky-400 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-xl border border-rose-500/40 px-4 py-2.5 font-medium text-rose-300 hover:bg-rose-500/10"
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}
