import json from "@/lib/json";
import { SESSION_COOKIE } from "@/lib/auth-errors";
import { verifyIdToken } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { idToken?: string };
    const idToken = body.idToken?.trim() ?? "";
    if (!idToken) {
      return json({ success: false, error: "Missing ID token" }, 400);
    }

    await verifyIdToken(idToken);

    const response = json({ success: true });
    response.headers.set(
      "Set-Cookie",
      `${SESSION_COOKIE}=${encodeURIComponent(idToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`,
    );
    return response;
  } catch {
    return json({ success: false, error: "Invalid session" }, 401);
  }
}

export async function DELETE() {
  const response = json({ success: true });
  response.headers.set(
    "Set-Cookie",
    `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  );
  return response;
}
