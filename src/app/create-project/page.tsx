"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { postProject } from "@/lib/api";

export default function CreateProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");
    try {
      await postProject({ name, description, dueDate: dueDate || null });
      router.push("/projects");
    } catch (err: any) {
      setError(err.message || "Could not create project");
      setLoading(false);
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto pt-10 pb-20"
    >
      <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Workspace
      </Link>
      
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Create New Project</h1>
        <p className="text-slate-400">Set up the foundation. The AI Risk Engine will start tracking immediately.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6 bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle decorative gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none -z-10" />

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Project Name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Marketing Site Redesign"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Description <span className="text-slate-500 font-normal">(Optional)</span></label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly describe the project goals..."
            rows={4}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Target Due Date <span className="text-slate-500 font-normal">(Optional)</span></label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all [color-scheme:dark]"
          />
        </div>

        {error && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-sm text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
            {error}
          </motion.p>
        )}

        <div className="pt-4 flex items-center justify-end border-t border-white/5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || !name.trim()}
            className="rounded-full bg-white text-black px-8 py-3 font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:hover:bg-white flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Initialize Project
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
