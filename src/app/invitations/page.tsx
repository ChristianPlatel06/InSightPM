"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Check, X } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import type { Invitation } from "@/lib/types";

export default function InvitationsPage() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchInvitations();
  }, [user]);

  async function fetchInvitations() {
    try {
      const res = await fetch("/api/invitations");
      const data = await res.json();
      if (data.success) {
        setInvitations(data.invitations);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(id: string, status: "accepted" | "declined") {
    setProcessing(id);
    try {
      const res = await fetch(`/api/invitations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setInvitations(prev => prev.filter(i => i.id !== id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(null);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-white" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header className="pb-6 border-b border-white/5">
        <h1 className="text-4xl font-semibold tracking-tight text-white mb-2">
          Invitations
        </h1>
        <p className="text-slate-400">
          Manage your pending project invitations.
        </p>
      </header>

      {invitations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 border-dashed bg-[#0a0a0a]/50 p-16 text-center backdrop-blur-sm">
          <Mail className="w-12 h-12 text-slate-600 mb-4" />
          <h3 className="mb-2 text-xl font-medium text-white">No pending invitations</h3>
          <p className="text-slate-400">You're all caught up!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {invitations.map(invite => (
              <motion.div
                key={invite.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0a0a0a]/80 p-6 shadow-xl backdrop-blur-md"
              >
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">{invite.projectName}</h3>
                  <p className="text-sm text-slate-400 mb-2">Invited by <span className="text-white">{invite.senderName}</span></p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Role: {invite.role}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    disabled={processing === invite.id}
                    onClick={() => handleInvite(invite.id, "declined")}
                    className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" /> Decline
                  </button>
                  <button
                    disabled={processing === invite.id}
                    onClick={() => handleInvite(invite.id, "accepted")}
                    className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" /> Accept
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
