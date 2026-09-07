"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/components/AuthProvider";
import { postProject } from "@/lib/api";
import { PROJECT_STATUSES, type ProjectStatus } from "@/lib/types";

export default function CreateProjectPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("Planned");
  const [progress, setProgress] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const ownerValue = owner || user?.displayName || user?.email || "";

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const project = await postProject({
        name,
        description,
        owner: ownerValue,
        status,
        progress,
        dueDate: dueDate || null,
      });
      router.push(`/projects/${project.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not create project");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold text-white">Create project</h1>
      <p className="mt-2 text-slate-400">
        Save a new project to Firestore and open its monitoring page.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
        <label className="block">
          <span className="mb-1.5 block text-sm text-slate-300">Project name</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-500"
            placeholder="Student goals tracker"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm text-slate-300">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-500"
            placeholder="What is this project delivering?"
          />
        </label>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm text-slate-300">Owner</span>
            <input
              value={ownerValue}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-500"
              placeholder="Alex Rivera"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm text-slate-300">Due date</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-500"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm text-slate-300">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
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
            <span className="mb-1.5 block text-sm text-slate-300">Progress ({progress}%)</span>
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="mt-3 w-full"
            />
          </label>
        </div>

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-sky-500 px-4 py-2.5 font-medium text-white hover:bg-sky-400 disabled:opacity-60 sm:w-auto"
        >
          {saving ? "Creating…" : "Create project"}
        </button>
      </form>
    </div>
  );
}
