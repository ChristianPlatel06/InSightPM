"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus, Shield, CheckCircle2 } from "lucide-react";
import type { Project, ProjectMember, UserProfile } from "@/lib/types";

export default function TeamTab({ project, currentUserUid, onUpdate }: { project: Project; currentUserUid: string; onUpdate: () => void }) {
  const [isInviting, setIsInviting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [inviteRole, setInviteRole] = useState("Member");
  const [sendingInvite, setSendingInvite] = useState<string | null>(null);

  const isOwner = project.members.some(m => m.uid === currentUserUid && m.role === "Owner");

  async function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success) setSearchResults(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  }

  async function sendInvite(email: string) {
    setSendingInvite(email);
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, recipientEmail: email, role: inviteRole }),
      });
      if (res.ok) {
        alert("Invitation sent!");
        setIsInviting(false);
        setSearchQuery("");
      } else {
        alert("Failed to send invite");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSendingInvite(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Team Members</h2>
        {isOwner && (
          <button
            onClick={() => setIsInviting(!isInviting)}
            className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
          >
            <UserPlus className="w-4 h-4" /> Invite Member
          </button>
        )}
      </div>

      <AnimatePresence>
        {isInviting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6 backdrop-blur-sm">
              <h3 className="text-lg font-medium text-white mb-4">Send Invitation</h3>
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by email or name..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] pl-10 pr-4 py-2 text-white outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors"
                >
                  <option>Backend Engineer</option>
                  <option>Frontend Engineer</option>
                  <option>UI Designer</option>
                  <option>Tester</option>
                  <option>Documentation Lead</option>
                  <option>Project Manager</option>
                  <option>Viewer</option>
                </select>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2 mt-4 max-h-60 overflow-y-auto pr-2">
                  {searchResults.map(u => (
                    <div key={u.uid} className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                      <div>
                        <p className="text-white font-medium">{u.displayName}</p>
                        <p className="text-sm text-slate-400">{u.email}</p>
                      </div>
                      <button
                        onClick={() => sendInvite(u.email)}
                        disabled={sendingInvite === u.email}
                        className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors disabled:opacity-50"
                      >
                        {sendingInvite === u.email ? "Sending..." : "Invite"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {searchQuery && !searching && searchResults.length === 0 && (
                <p className="text-slate-400 text-sm mt-4">No users found.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {project.members?.map(member => (
          <div key={member.uid} className="rounded-2xl border border-white/10 bg-[#0a0a0a]/80 p-5 shadow-xl backdrop-blur-md flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-white font-medium leading-tight">{member.name}</h4>
                  <p className="text-xs text-slate-400">{member.role}</p>
                </div>
              </div>
              {member.role === "Owner" && <Shield className="w-4 h-4 text-amber-400" />}
            </div>
            
            <div className="mt-auto pt-4 border-t border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-slate-400">Assigned Tasks Completion</span>
                <span className="text-xs font-medium text-white">{member.completion}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${member.completion}%` }} />
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                {member.skills?.slice(0, 3).map((skill, i) => (
                  <span key={i} className="px-2 py-1 bg-white/5 text-slate-300 rounded text-[10px] border border-white/10 uppercase tracking-wide">
                    {skill}
                  </span>
                ))}
                {(member.skills?.length || 0) > 3 && (
                  <span className="px-2 py-1 bg-white/5 text-slate-400 rounded text-[10px] border border-white/10">
                    +{member.skills.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
