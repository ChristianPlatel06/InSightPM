"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, BarChart3, Activity, AlertTriangle, CheckCircle2, ChevronRight, HeartPulse } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import ProjectCard from "@/components/ProjectCard";
import { useAuth } from "@/components/AuthProvider";
import { fetchProjects } from "@/lib/api";
import { type Project } from "@/lib/types";
import { calculateRiskAssessment } from "@/lib/risk";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const duration = 1000;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(ease * value));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);

  return <>{count}{suffix}</>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchProjects();
        setProjects(data);
      } catch (error) {
        console.error("Error loading projects:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-2xl mx-auto text-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full" />
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 relative">
            Project management for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">AI era.</span>
          </h1>
        </div>
        <p className="text-xl text-slate-400 max-w-xl mx-auto">
          InSightPM uses advanced risk engines and Gemini 3.5 Flash to automatically analyze deadlines, predict blockers, and keep your team shipping.
        </p>
        <Link href="/login" className="mt-8 rounded-full bg-white text-black px-8 py-4 font-semibold hover:bg-slate-200 transition-colors inline-flex items-center gap-2">
          Start Managing <ChevronRight className="w-5 h-5"/>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-white" />
      </div>
    );
  }

  const total = projects.length;
  const completed = projects.filter(p => p.status === "Completed").length;
  const avgProgress = total > 0 ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / total) : 0;
  
  const avgRisk = projects.length > 0 
    ? projects.reduce((acc, p) => acc + calculateRiskAssessment(p).score, 0) / projects.length
    : 0;
  const workspaceHealth = projects.length > 0 ? Math.max(0, 100 - Math.round(avgRisk)) : 100;

  const riskAssessments = projects.map(p => calculateRiskAssessment(p));
  const atRisk = riskAssessments.filter(r => r.level === "High" || r.level === "Critical").length;

  const chartData = projects.map((p, i) => ({
    name: p.name.substring(0, 15) + (p.name.length > 15 ? "..." : ""),
    progress: p.progress,
    risk: riskAssessments[i].score,
    riskColor: riskAssessments[i].color.split(" ")[0].replace("bg-", "").replace("/10", ""), 
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-white/5">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-4xl font-semibold tracking-tight text-white mb-2">
            Workspace
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-slate-400">
            Welcome back, {user.email?.split("@")[0]}. Here's your mission control.
          </motion.p>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Link
            href="/create-project"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black hover:bg-slate-200 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Project
          </Link>
        </motion.div>
      </header>

      {projects.length > 0 && (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          <motion.div variants={item} className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center gap-3 text-emerald-400 mb-4"><HeartPulse className="w-5 h-5"/> Health Score</div>
            <p className="text-4xl font-semibold text-white"><AnimatedCounter value={workspaceHealth} suffix="%" /></p>
          </motion.div>

          <motion.div variants={item} className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center gap-3 text-slate-400 mb-4"><BarChart3 className="w-5 h-5"/> Total Projects</div>
            <p className="text-4xl font-semibold text-white"><AnimatedCounter value={total} /></p>
          </motion.div>
          
          <motion.div variants={item} className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center gap-3 text-emerald-400 mb-4"><CheckCircle2 className="w-5 h-5"/> Completed</div>
            <p className="text-4xl font-semibold text-white"><AnimatedCounter value={completed} /></p>
          </motion.div>

          <motion.div variants={item} className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center gap-3 text-blue-400 mb-4"><Activity className="w-5 h-5"/> Avg. Progress</div>
            <p className="text-4xl font-semibold text-white"><AnimatedCounter value={avgProgress} suffix="%" /></p>
          </motion.div>

          <motion.div variants={item} className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center gap-3 text-rose-400 mb-4"><AlertTriangle className="w-5 h-5"/> High Risk</div>
            <p className="text-4xl font-semibold text-white"><AnimatedCounter value={atRisk} /></p>
          </motion.div>
        </motion.div>
      )}

      {projects.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-3xl border border-white/10 bg-[#0a0a0a]/50 p-8 shadow-2xl backdrop-blur-md"
        >
          <div className="mb-6 flex items-center gap-3">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-semibold text-white">Progress vs Risk Profile</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} 
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="progress" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Progress %" />
                <Bar dataKey="risk" radius={[4, 4, 0, 0]} name="Risk Score">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      entry.riskColor === "rose-500" ? "#f43f5e" : 
                      entry.riskColor === "orange-500" ? "#f97316" : 
                      entry.riskColor === "emerald-500" ? "#10b981" : 
                      "#64748b"
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Active Projects</h2>
        </div>
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 border-dashed bg-[#0a0a0a]/50 p-16 text-center backdrop-blur-sm">
            <h3 className="mb-2 text-xl font-medium text-white">No projects found</h3>
            <p className="mb-6 text-slate-400">Initialize your first project to activate the AI risk engine.</p>
            <Link
              href="/create-project"
              className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black hover:bg-slate-200 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Project
            </Link>
          </div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <AnimatePresence>
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
