import json from "@/lib/json";
import { requireUser } from "@/lib/auth-server";
import { searchUsers } from "@/lib/users";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if ("error" in auth) return json({ success: false, error: auth.error }, auth.status);

  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") || "";
    
    if (q.length < 2) {
      return json({ success: true, users: [] });
    }

    const users = await searchUsers(auth.token, q);
    // Filter out self
    const filtered = users.filter(u => u.uid !== auth.user.uid);
    
    return json({ success: true, users: filtered });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return json({ success: false, error: message }, 500);
  }
}
