"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus, Shield, X, Users, Loader2, UserX, ChevronDown } from "lucide-react";
import type { Project, ProjectMember, UserProfile } from "@/lib/types";
import { patchProject } from "@/lib/api";

const ROLES = [
  "Owner",
  "Project Manager",
  "Backend Engineer",
  "Frontend Engineer",
  "UI Designer",
  "Tester",
  "Documentation Lead",
  "Viewer",
] as const;

export default function TeamTab({ project, currentUserUid, onUpdate }: { project: Project; currentUserUid: string; onUpdate: () => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [addRole, setAddRole] = useState<string>("Frontend Engineer");
  const [addingUid, setAddingUid] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isOwner = project.ownerId === currentUserUid;

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    setError("");
    if (q.length < 2) {
      setSearchResults([]);
      setSearched(false);
      return;
    }
    setSearching(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        // Filter out users already in the project
        const existingUids = new Set(project.memberIds);
        setSearchResults(data.users.filter((u: UserProfile) => !existingUids.has(u.uid)));
      }
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  }, [project.memberIds]);

  async function addMember(user: UserProfile) {
    setAddingUid(user.uid);
    setError("");
    try {
      const newMember: ProjectMember = {
        uid: user.uid,
        name: user.displayName || user.email,
        email: user.email,
        role: addRole,
        skills: user.skills || [],
        completion: 0,
      };

      const newActivity = {
        id: Date.now().toString(),
        description: `${project.members.find(m => m.uid === currentUserUid)?.name || "Owner"} added ${newMember.name} as ${addRole}`,
        timestamp: new Date().toISOString(),
      };

      await patchProject(project.id, {
        memberIds: [...project.memberIds, user.uid],
        members: [...project.members, newMember],
        activities: [newActivity, ...project.activities].slice(0, 50),
      });

      // Remove from search results and refresh
      setSearchResults(prev => prev.filter(u => u.uid !== user.uid));
      onUpdate();
    } catch {
      setError("Failed to add member. Please try again.");
    } finally {
      setAddingUid(null);
    }
  }

  async function removeMember(uid: string) {
    if (!confirm("Remove this member from the project?")) return;
    setSaving(true);
    setError("");
    try {
      const removed = project.members.find(m => m.uid === uid);
      const newActivity = {
        id: Date.now().toString(),
        description: `${project.members.find(m => m.uid === currentUserUid)?.name || "Owner"} removed ${removed?.name || "a member"} from the project`,
        timestamp: new Date().toISOString(),
      };

      await patchProject(project.id, {
        memberIds: project.memberIds.filter(id => id !== uid),
        members: project.members.filter(m => m.uid !== uid),
        activities: [newActivity, ...project.activities].slice(0, 50),
      });
      onUpdate();
    } catch {
      setError("Failed to remove member.");
    } finally {
      setSaving(false);
    }
  }

  async function changeRole(uid: string, newRole: string) {
    setSaving(true);
    setError("");
    try {
      const member = project.members.find(m => m.uid === uid);
      const newActivity = {
        id: Date.now().toString(),
        description: `${project.members.find(m => m.uid === currentUserUid)?.name || "Owner"} changed ${member?.name || "member"}'s role to ${newRole}`,
        timestamp: new Date().toISOString(),
      };

      await patchProject(project.id, {
        members: project.members.map(m => m.uid === uid ? { ...m, role: newRole } : m),
        activities: [newActivity, ...project.activities].slice(0, 50),
      });
      setEditingRole(null);
      onUpdate();
    } catch {
      setError("Failed to update role.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Team Members</h2>
            <p className="text-sm text-slate-400">{project.members.length} member{project.members.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        {isOwner && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setIsAdding(!isAdding); setSearchQuery(""); setSearchResults([]); setSearched(false); }}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
          >
            {isAdding ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {isAdding ? "Cancel" : "Add Member"}
          </motion.button>
        )}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Member Panel */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
              <h3 className="text-lg font-medium text-white mb-4">Search & Add Team Member</h3>
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by email or name..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] pl-10 pr-4 py-2.5 text-white outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500"
                    autoFocus
                  />
                </div>
                <select
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value)}
                  className="rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-2.5 text-white outline-none focus:border-blue-500 transition-colors text-sm"
                >
                  {ROLES.filter(r => r !== "Owner").map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Loading */}
              {searching && (
                <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                  <Loader2 className="w-4 h-4 animate-spin" /> Searching users...
                </div>
              )}

              {/* Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {searchResults.map(u => (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={u.uid}
                      className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {(u.displayName || u.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{u.displayName}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => addMember(u)}
                        disabled={addingUid === u.uid}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {addingUid === u.uid ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding...</>
                        ) : (
                          <><UserPlus className="w-3.5 h-3.5" /> Add to Team</>
                        )}
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* No Results */}
              {searched && !searching && searchResults.length === 0 && searchQuery.length >= 2 && (
                <div className="text-center py-6">
                  <UserX className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">No users found matching &ldquo;{searchQuery}&rdquo;</p>
                  <p className="text-slate-500 text-xs mt-1">They may need to create an account first.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {project.members?.map((member, idx) => (
          <motion.div
            key={member.uid}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group relative rounded-2xl border border-white/10 bg-[#0a0a0a]/80 p-5 shadow-xl backdrop-blur-md flex flex-col h-full hover:border-white/20 transition-colors"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-white font-medium leading-tight">{member.name}</h4>
                  <p className="text-xs text-slate-400">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {member.uid === project.ownerId && <Shield className="w-4 h-4 text-amber-400" />}
                {isOwner && member.uid !== project.ownerId && (
                  <button
                    onClick={() => removeMember(member.uid)}
                    disabled={saving}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all"
                    title="Remove member"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Role Badge + Inline Edit */}
            <div className="mb-4">
              {isOwner && member.uid !== project.ownerId && editingRole === member.uid ? (
                <select
                  value={member.role}
                  onChange={(e) => changeRole(member.uid, e.target.value)}
                  onBlur={() => setEditingRole(null)}
                  autoFocus
                  className="rounded-lg border border-blue-500/30 bg-[#0a0a0a] px-3 py-1.5 text-xs text-white outline-none w-full"
                >
                  {ROLES.filter(r => r !== "Owner").map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              ) : (
                <button
                  onClick={() => isOwner && member.uid !== project.ownerId && setEditingRole(member.uid)}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    member.uid === project.ownerId
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-default"
                      : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  } ${isOwner && member.uid !== project.ownerId ? "hover:bg-blue-500/20 cursor-pointer" : "cursor-default"}`}
                >
                  {member.role}
                  {isOwner && member.uid !== project.ownerId && <ChevronDown className="w-3 h-3 opacity-50" />}
                </button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mt-auto pt-4 border-t border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-slate-400">Task Completion</span>
                <span className="text-xs font-semibold text-white">{member.completion}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${member.completion}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    member.completion >= 80 ? "bg-emerald-500" :
                    member.completion >= 50 ? "bg-blue-500" :
                    member.completion >= 25 ? "bg-amber-500" : "bg-slate-500"
                  }`}
                />
              </div>

              {/* Skills */}
              {member.skills && member.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {member.skills.slice(0, 3).map((skill, i) => (
                    <span key={i} className="px-2 py-1 bg-white/5 text-slate-300 rounded text-[10px] border border-white/10 uppercase tracking-wide">
                      {skill}
                    </span>
                  ))}
                  {member.skills.length > 3 && (
                    <span className="px-2 py-1 bg-white/5 text-slate-400 rounded text-[10px] border border-white/10">
                      +{member.skills.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {(!project.members || project.members.length === 0) && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No team members yet.</p>
          {isOwner && <p className="text-slate-500 text-sm mt-1">Click &ldquo;Add Member&rdquo; to get started.</p>}
        </div>
      )}
    </div>
  );
}
