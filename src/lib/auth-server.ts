import { createRemoteJWKSet, jwtVerify } from "jose";
import { firebaseProjectId } from "@/lib/firebase-config";
import { SESSION_COOKIE, type AuthTokenPayload } from "@/lib/auth-errors";

const FIREBASE_JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);

export async function verifyIdToken(token: string): Promise<AuthTokenPayload> {
  const { payload } = await jwtVerify(token, FIREBASE_JWKS, {
    issuer: `https://securetoken.google.com/${firebaseProjectId}`,
    audience: firebaseProjectId,
  });

  const uid = typeof payload.sub === "string" ? payload.sub : "";
  if (!uid) {
    throw new Error("Invalid Firebase token");
  }

  return {
    uid,
    email: typeof payload.email === "string" ? payload.email : null,
    name: typeof payload.name === "string" ? payload.name : null,
    picture: typeof payload.picture === "string" ? payload.picture : null,
  };
}

export function getTokenFromRequest(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    return header.slice(7).trim() || null;
  }

  const cookie = request.headers.get("cookie");
  if (!cookie) return null;

  const parts = cookie.split(";").map((part) => part.trim());
  const match = parts.find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  if (!match) return null;

  return decodeURIComponent(match.slice(SESSION_COOKIE.length + 1)) || null;
}

export async function requireUser(
  request: Request,
): Promise<{ user: AuthTokenPayload; token: string } | { error: string; status: number }> {
  const token = getTokenFromRequest(request);
  if (!token) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const user = await verifyIdToken(token);
    return { user, token };
  } catch {
    return { error: "Unauthorized", status: 401 };
  }
}
