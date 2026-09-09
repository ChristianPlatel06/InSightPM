import { BASE_URL, type FirestoreDocument, type FirestoreValue } from "./projects";
import type { UserProfile } from "./types";

const COLLECTION = "users";

export function toUserProfile(doc: FirestoreDocument): UserProfile {
  const fields = doc.fields || {};
  return {
    uid: doc.name?.split("/").pop() || "",
    displayName: (fields.displayName as any)?.stringValue || "",
    email: (fields.email as any)?.stringValue || "",
    avatar: (fields.avatar as any)?.stringValue || "",
    roleTitle: (fields.roleTitle as any)?.stringValue || "Member",
    skills: (fields.skills as any)?.arrayValue?.values?.map((v: any) => v.stringValue || "") || [],
    createdAt: (fields.createdAt as any)?.stringValue || "",
  };
}

export function encodeUserProfile(data: Partial<UserProfile>): Record<string, FirestoreValue> {
  return {
    displayName: { stringValue: data.displayName || "" },
    email: { stringValue: data.email || "" },
    avatar: { stringValue: data.avatar || "" },
    roleTitle: { stringValue: data.roleTitle || "Member" },
    skills: { arrayValue: { values: (data.skills || []).map(s => ({ stringValue: s })) } },
    createdAt: { stringValue: data.createdAt || new Date().toISOString() },
  };
}

export async function getUserProfile(token: string, uid: string): Promise<UserProfile | null> {
  const response = await fetch(`${BASE_URL}/${COLLECTION}/${uid}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Could not load user profile");

  return toUserProfile(await response.json());
}

export async function syncUserProfile(token: string, user: { uid: string; email: string | null; name: string | null; picture: string | null }) {
  try {
    const existing = await getUserProfile(token, user.uid);
    if (existing) {
      // Could patch updates here, but skipping to save tokens if it already exists
      return existing;
    }
    
    // Create new user profile
    const payload = encodeUserProfile({
      uid: user.uid,
      displayName: user.name || user.email || "Unknown User",
      email: user.email || "",
      avatar: user.picture || "",
      roleTitle: "Member",
      skills: [],
      createdAt: new Date().toISOString(),
    });

    await fetch(`${BASE_URL}/${COLLECTION}?documentId=${user.uid}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields: payload }),
    });
  } catch (e) {
    console.error("Failed to sync user profile", e);
  }
}

export async function searchUsers(token: string, query: string): Promise<UserProfile[]> {
  const response = await fetch(`${BASE_URL}:runQuery`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: COLLECTION }],
        limit: 10
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Search failed");
  const rows = (await response.json()) as Array<{ document?: FirestoreDocument }>;
  
  const q = query.toLowerCase();
  return rows
    .map(row => row.document ? toUserProfile(row.document) : null)
    .filter((u): u is UserProfile => Boolean(u && (u.email.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q))));
}
