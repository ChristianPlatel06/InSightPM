"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/components/AuthProvider";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/create-project", label: "Create" },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logOut } = useAuth();
  const [open, setOpen] = useState(false);
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  useEffect(() => {
    if (loading) return;
    if (!user && !isAuthPage) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
    if (user && isAuthPage) {
      router.replace("/");
    }
  }, [isAuthPage, loading, pathname, router, user]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  async function onLogout() {
    await logOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-full bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href={user ? "/" : "/login"} className="text-lg font-semibold tracking-tight">
            InSightPM
          </Link>

          {isAuthPage ? (
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/login" className="rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-900">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-sky-500 px-3 py-2 font-medium text-white hover:bg-sky-400"
              >
                Sign up
              </Link>
            </nav>
          ) : (
            <>
              <nav className="hidden items-center gap-1 sm:flex">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-lg px-3 py-2 text-sm ${
                      isActive(link.href)
                        ? "bg-slate-800 text-white"
                        : "text-slate-300 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="hidden items-center gap-3 sm:flex">
                {loading ? (
                  <span className="text-sm text-slate-400">Loading…</span>
                ) : user ? (
                  <>
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={user.displayName ?? "Profile"}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs">
                        {(user.displayName ?? user.email ?? "U").slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <div className="leading-tight">
                      <p className="text-sm font-medium text-white">
                        {user.displayName || "Signed in"}
                      </p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={onLogout}
                      className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-900"
                    >
                      Log out
                    </button>
                  </>
                ) : null}
              </div>

              <button
                type="button"
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm sm:hidden"
                onClick={() => setOpen((value) => !value)}
              >
                Menu
              </button>
            </>
          )}
        </div>

        {open && !isAuthPage ? (
          <div className="border-t border-slate-800 px-4 py-3 sm:hidden">
            <nav>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-sm ${
                    isActive(link.href) ? "bg-slate-800 text-white" : "text-slate-300"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            {user ? (
              <div className="mt-3 border-t border-slate-800 pt-3">
                <p className="text-sm font-medium text-white">{user.displayName || "Signed in"}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
                <button
                  type="button"
                  onClick={onLogout}
                  className="mt-3 rounded-lg border border-slate-700 px-3 py-1.5 text-sm"
                >
                  Log out
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
