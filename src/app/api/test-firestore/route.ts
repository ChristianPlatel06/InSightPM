import json from "@/lib/json";
import { requireUser } from "@/lib/auth-server";
import { firebaseProjectId } from "@/lib/firebase-config";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if ("error" in auth) return json({ success: false, error: auth.error }, auth.status);

  try {
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents/test`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            message: { stringValue: "Firebase is connected" },
            ownerId: { stringValue: auth.user.uid },
            createdAt: { stringValue: new Date().toISOString() },
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Firestore write failed");
    }

    const data = (await response.json()) as { name?: string };
    const id = data.name?.split("/").pop() ?? null;
    return json({ success: true, id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return json({ success: false, error: message }, 500);
  }
}
