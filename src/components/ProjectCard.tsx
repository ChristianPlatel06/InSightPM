"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Target, Activity, Users, ShieldAlert } from "lucide-react";
import type { Project } from "@/lib/types";
import { calculateRiskAssessment, formatIndianDate, calculateDaysRemaining } from "@/lib/risk";
import ProgressBar from "./ProgressBar";
import StatusBadge from "./StatusBadge";

export default function ProjectCard({ project }: { project: Project }) {
  const risk = calculateRiskAssessment(project);
  const daysLeft = calculateDaysRemaining(project.dueDate);
  const isOverdue = daysLeft !== null && daysLeft < 0;

  let dueLine = formatIndianDate(project.dueDate);
  if (daysLeft !== null) {
    if (daysLeft < 0) dueLine += ` (${Math.abs(daysLeft)}d overdue)`;
    else if (daysLeft === 0) dueLine += " (Today!)";
    else if (daysLeft <= 7) dueLine += ` (${daysLeft}d left)`;
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative flex flex-col rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-sm transition-all hover:border-white/20 hover:shadow-xl hover:shadow-black/50 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      
      <div className="flex items-start justify-between mb-4 z-10">
        <h3 className="text-xl font-semibold text-white tracking-tight line-clamp-1">{project.name}</h3>
        <StatusBadge status={project.status} />
      </div>

      <p className="mb-6 text-sm text-slate-400 line-clamp-2 min-h-[40px] z-10">
        {project.description || "No description provided."}
      </p>

      <div className="mb-6 z-10">
        <div className="flex justify-between items-end mb-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5" /> Progress
          </div>
          <span className="text-sm font-semibold text-white">{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} />
      </div>

      <div className="mt-auto grid grid-cols-3 gap-3 border-t border-white/5 pt-4 z-10">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><Target className="w-3.5 h-3.5"/> Owner</span>
          <span className="text-sm font-medium text-slate-200 truncate">{project.owner || "Unassigned"}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> Due</span>
          <span className={`text-sm font-medium ${isOverdue ? 'text-rose-400' : 'text-slate-200'}`}>
            {dueLine}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><Users className="w-3.5 h-3.5"/> Team</span>
          <span className="text-sm font-medium text-slate-200">{project.members?.length || 1} member{(project.members?.length || 1) !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Risk Engine Overlay */}
      <div className={`mt-4 rounded-xl border ${risk.color} p-2.5 flex items-center justify-between z-10`}>
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold uppercase tracking-wider">Risk: {risk.level}</span>
        </div>
        <span className="text-xs font-bold opacity-80">{risk.score}/100</span>
      </div>

      <Link
        href={`/projects/${project.id}`}
        className="absolute inset-0 z-20 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl"
      >
        <span className="sr-only">View project details</span>
      </Link>
    </motion.div>
  );
}
