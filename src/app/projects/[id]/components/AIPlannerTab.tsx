"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, AlertTriangle, Users, Target, CheckCircle2 } from "lucide-react";
import type { Project } from "@/lib/types";

export default function AIPlannerTab({ project, onUpdate }: { project: Project; onUpdate: (project: Project) => void }) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  async function generatePlan() {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${project.id}/plan`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        onUpdate(data.project);
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError("Failed to generate plan");
    } finally {
      setGenerating(false);
    }
  }

  const plan = project.aiTeamPlan;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">AI Team Planner</h2>
          <p className="text-sm text-slate-400">Intelligent task allocation based on team skills and risk profile.</p>
        </div>
        <button
          onClick={generatePlan}
          disabled={generating}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
        >
          {generating ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          {plan ? "Regenerate Plan" : "Generate Team Plan"}
        </button>
      </div>

      {error && <p className="text-rose-400 text-sm">{error}</p>}

      {!plan ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 border-dashed bg-[#0a0a0a]/50 p-16 text-center backdrop-blur-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
            <Zap className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="mb-2 text-xl font-medium text-white">No AI Plan Generated</h3>
          <p className="text-slate-400 max-w-md">
            Click the button above to let Gemini analyze your project scope, team composition, and skills to recommend an optimal work distribution.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Allocations */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2"><Users className="w-5 h-5 text-indigo-400"/> Workload Distribution</h3>
            {plan.allocations.map((alloc, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-white/10 bg-[#0a0a0a]/80 p-5 backdrop-blur-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-white font-medium text-lg">{alloc.name}</h4>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-slate-400 uppercase tracking-wide">Ownership</span>
                    <span className="text-xl font-bold text-indigo-400">{alloc.ownershipPercentage}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-xs text-slate-500 font-medium">Assigned Responsibilities</span>
                  <ul className="space-y-1">
                    {alloc.tasks.map((task, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> {task}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Warnings & Recs */}
          <div className="space-y-6">
            {plan.missingSkillsWarnings.length > 0 && (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5">
                <h3 className="text-sm font-medium text-rose-400 flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4"/> Skill Gaps Identified</h3>
                <ul className="space-y-2">
                  {plan.missingSkillsWarnings.map((warn, i) => (
                    <li key={i} className="text-sm text-rose-200/80 leading-snug">{warn}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/80 p-5">
              <h3 className="text-sm font-medium text-amber-400 flex items-center gap-2 mb-3"><Target className="w-4 h-4"/> Team Recommendations</h3>
              <ul className="space-y-3">
                {plan.teamRecommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-slate-300 leading-snug pb-3 border-b border-white/5 last:border-0 last:pb-0">{rec}</li>
                ))}
              </ul>
            </div>
            
            <p className="text-xs text-slate-500 text-center">Plan generated on {new Date(plan.generatedAt).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
