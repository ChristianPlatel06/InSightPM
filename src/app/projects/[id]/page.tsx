"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ArrowLeft, Calendar, CheckCircle2, ChevronRight, Clock, Activity, Target, Zap, ShieldAlert } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import StatusBadge from "@/components/StatusBadge";
import { analyzeProject, deleteProject, fetchProject, patchProject } from "@/lib/api";
import { PROJECT_STATUSES, type Project, type ProjectStatus } from "@/lib/types";
import { calculateRiskAssessment, formatIndianDate, calculateDaysRemaining } from "@/lib/risk";

import TeamTab from "./components/TeamTab";
import AIPlannerTab from "./components/AIPlannerTab";
import ActivityTab from "./components/ActivityTab";
import { useAuth } from "@/components/AuthProvider";

export default function ProjectDetailsPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  
  const [updateText, setUpdateText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

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
    if (!id || !confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
    try {
      await deleteProject(id);
      router.push("/projects");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not delete project");
    }
  }

  async function onAnalyze() {
    if (!id || !updateText.trim()) return;
    setAnalyzing(true);
    setError("");
    try {
      const updated = await analyzeProject(id, updateText);
      setProject(updated);
      setUpdateText("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not analyze project");
    } finally {
      setAnalyzing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-8 w-8 rounded-full border-b-2 border-white"
        />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-rose-400 mb-4">{error || "Project not found."}</p>
        <Link href="/projects" className="flex items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to projects
        </Link>
      </div>
    );
  }

  const risk = calculateRiskAssessment(project);

  let countdownStr = "No deadline";
  let countdownColor = "text-slate-400";
  const daysLeft = calculateDaysRemaining(project.dueDate);
  if (daysLeft !== null) {
    if (daysLeft < 0) {
      countdownStr = `Overdue by ${Math.abs(daysLeft)} days`;
      countdownColor = "text-rose-400";
    } else if (daysLeft === 0) {
      countdownStr = "Deadline is today!";
      countdownColor = "text-orange-400";
    } else if (daysLeft <= 3) {
      countdownStr = `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`;
      countdownColor = "text-amber-400";
    } else {
      countdownStr = `${daysLeft} days remaining`;
      countdownColor = "text-emerald-400";
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-5xl mx-auto pb-20"
    >
      {/* Header Section */}
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between pb-6 border-b border-white/5">
        <div>
          <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Workspace
          </Link>
          <motion.h1 layoutId={`project-title-${project.id}`} className="text-4xl font-semibold tracking-tight text-white mb-2">
            {project.name}
          </motion.h1>
          <p className="max-w-2xl text-slate-400 text-lg">
            {project.description || "No description provided."}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={project.status} />
          <span className={`text-sm font-medium ${countdownColor}`}>{countdownStr}</span>
        </div>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <motion.div whileHover={{ y: -2 }} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-sm font-medium">Progress</span>
          </div>
          <p className="text-2xl font-semibold text-white mb-3">{project.progress}%</p>
          <ProgressBar value={project.progress} />
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Due Date</span>
          </div>
          <p className="text-2xl font-semibold text-white">
            {formatIndianDate(project.dueDate)}
          </p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Target className="w-4 h-4" />
            <span className="text-sm font-medium">Owner</span>
          </div>
          <p className="text-2xl font-semibold text-white truncate">{project.owner || "Unassigned"}</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={`rounded-2xl border p-5 backdrop-blur-sm ${risk.color}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 opacity-80">
              <ShieldAlert className="w-4 h-4" />
              <span className="text-sm font-medium">Risk Engine</span>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-black/20 uppercase tracking-wider">{risk.level}</span>
          </div>
          <p className="text-3xl font-semibold mb-1">{risk.score}<span className="text-lg opacity-50">/100</span></p>
          <p className="text-xs opacity-80 leading-tight">{risk.explanation}</p>
        </motion.div>
      </div>

      <div className="flex items-center gap-6 border-b border-white/5 mb-8">
        {["Overview", "Team", "AI Planner", "Activity"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === tab ? "text-white" : "text-slate-500 hover:text-slate-300"}`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === "Overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        
        {/* Left Column: AI & Updates */}
        <div className="lg:col-span-2 space-y-6">
          
          <AnimatePresence>
            {(project.aiCompletionProbability || project.aiTopRisks || project.aiRecommendedActions || project.aiSuggestedPriorities) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 shadow-[0_0_30px_rgba(99,102,241,0.05)] backdrop-blur-md"
              >
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                      <Zap className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">AI Project Advisor</h2>
                  </div>
                  <span className="text-xs text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">Gemini 3.5 Flash</span>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    {project.aiCompletionProbability && (
                      <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                        <h3 className="text-sm font-medium text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4" /> Completion Probability
                        </h3>
                        <p className="text-white text-lg font-medium">{project.aiCompletionProbability}</p>
                      </div>
                    )}

                    {project.aiTopRisks && project.aiTopRisks.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-rose-400 mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" /> Top Risks
                        </h3>
                        <ul className="space-y-2">
                          {project.aiTopRisks.map((action, i) => (
                            <motion.li 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              key={i} 
                              className="flex items-start gap-3 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20"
                            >
                              <span className="text-rose-200 text-sm leading-snug">{action}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {project.aiSuggestedPriorities && project.aiSuggestedPriorities.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-amber-400 mb-3 flex items-center gap-2">
                          <Target className="w-4 h-4" /> Suggested Priorities
                        </h3>
                        <ul className="space-y-2">
                          {project.aiSuggestedPriorities.map((action, i) => (
                            <motion.li 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              key={i} 
                              className="flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/5"
                            >
                              <span className="text-slate-200 text-sm leading-snug">{action}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {project.aiRecommendedActions && project.aiRecommendedActions.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-emerald-400 mb-3 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Recommended Actions
                        </h3>
                        <ul className="space-y-2">
                          {project.aiRecommendedActions.map((action, i) => (
                            <motion.li 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              key={i} 
                              className="flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/5"
                            >
                              <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="text-slate-200 text-sm leading-snug">{action}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500" />
            <h2 className="text-lg font-semibold text-white mb-2">Provide an Update</h2>
            <p className="text-sm text-slate-400 mb-5">
              Type naturally. The AI Analyst will parse your update, recalculate progress, adjust risk levels, and generate a new report automatically.
            </p>
            
            <textarea
              value={updateText}
              onChange={(e) => setUpdateText(e.target.value)}
              rows={3}
              placeholder="e.g. Completed the authentication flow, but blocked on the database migrations..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
            />
            
            <div className="mt-4 flex items-center justify-between">
              {error && <p className="text-sm text-rose-400">{error}</p>}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onAnalyze}
                disabled={analyzing || !updateText.trim()}
                className="ml-auto rounded-xl bg-white text-black px-6 py-2.5 font-medium hover:bg-slate-200 disabled:opacity-50 disabled:hover:bg-white flex items-center gap-2"
              >
                {analyzing ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" /> Run AI Analysis
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className="space-y-6">
          <form
            className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 flex flex-col gap-5"
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
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-lg font-semibold text-white">Project Settings</h2>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Project Name</span>
              <input
                value={project.name}
                onChange={(e) => setProject({ ...project, name: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30 transition-colors"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Status Override</span>
              <select
                value={project.status}
                onChange={(e) => setProject({ ...project, status: e.target.value as ProjectStatus })}
                className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-white outline-none focus:border-white/30 transition-colors appearance-none"
              >
                {PROJECT_STATUSES.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Owner Override</span>
              <input
                value={project.owner}
                onChange={(e) => setProject({ ...project, owner: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30 transition-colors"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Due Date</span>
              <input
                type="date"
                value={project.dueDate ?? ""}
                onChange={(e) => setProject({ ...project, dueDate: e.target.value || null })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30 transition-colors [color-scheme:dark]"
              />
            </label>

            <div className="mt-4 flex flex-col gap-3 pt-4 border-t border-white/5">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {saving && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />}
                Save Settings
              </motion.button>
              
              <button
                type="button"
                onClick={onDelete}
                className="w-full rounded-lg border border-rose-500/20 bg-transparent px-4 py-2 font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                Delete Project
              </button>
            </div>
          </form>
        </div>
      </div>
          )}

          {activeTab === "Team" && (
            <TeamTab project={project} currentUserUid={user?.uid || ""} onUpdate={() => fetchProject(id).then(setProject)} />
          )}

          {activeTab === "AI Planner" && (
            <AIPlannerTab project={project} onUpdate={setProject} />
          )}

          {activeTab === "Activity" && (
            <ActivityTab project={project} />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
