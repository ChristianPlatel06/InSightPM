import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth-errors";
import { verifyIdToken } from "@/lib/auth-server";

const PUBLIC_PATHS = new Set(["/login", "/signup", "/api/auth/session"]);

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.has(pathname);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value ?? null;
  let authenticated = false;

  if (token) {
    try {
      await verifyIdToken(token);
      authenticated = true;
    } catch {
      authenticated = false;
    }
  }

  if (!authenticated && !isPublic(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    const response = NextResponse.redirect(url);
    if (token) {
      response.cookies.delete(SESSION_COOKIE);
    }
    return response;
  }

  if (authenticated && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
