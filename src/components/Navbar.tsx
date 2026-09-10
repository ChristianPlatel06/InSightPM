"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "./AuthProvider";

export default function Navbar() {
  const { user, logOut } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-transform group-hover:scale-105">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">InSight<span className="text-blue-500">PM</span></span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link 
            href="/projects" 
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${pathname === "/projects" || pathname === "/" ? "text-white" : "text-slate-400 hover:text-white"}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>

          <div className="h-4 w-px bg-white/10" />

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400 hidden sm:block">{user.displayName || user.email}</span>
            <button
              onClick={() => logOut()}
              className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-rose-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
