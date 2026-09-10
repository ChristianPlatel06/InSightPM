"use client";

import { motion } from "framer-motion";
import { Activity as ActivityIcon } from "lucide-react";
import type { Project } from "@/lib/types";

export default function ActivityTab({ project }: { project: Project }) {
  const activities = project.activities || [];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h2 className="text-xl font-semibold text-white">Activity Feed</h2>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 border-dashed bg-[#0a0a0a]/50 p-16 text-center backdrop-blur-sm">
          <ActivityIcon className="w-10 h-10 text-slate-600 mb-4" />
          <h3 className="mb-1 text-lg font-medium text-white">No activity yet</h3>
          <p className="text-sm text-slate-400">Team changes, role updates, and project events will appear here.</p>
        </div>
      ) : (
        <div className="relative border-l border-white/10 ml-4 space-y-8 py-4">
          {activities.map((activity, i) => (
            <motion.div 
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative pl-6"
            >
              <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              <p className="text-slate-300 mb-1 leading-snug">{activity.description}</p>
              <span className="text-xs text-slate-500">{new Date(activity.timestamp).toLocaleString()}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
