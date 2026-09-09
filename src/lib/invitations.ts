import { BASE_URL, type FirestoreDocument, type FirestoreValue } from "./projects";
import type { Invitation } from "./types";

const COLLECTION = "invitations";

export function toInvitation(doc: FirestoreDocument): Invitation {
  const fields = doc.fields || {};
  return {
    id: doc.name?.split("/").pop() || "",
    projectId: (fields.projectId as any)?.stringValue || "",
    projectName: (fields.projectName as any)?.stringValue || "",
    senderId: (fields.senderId as any)?.stringValue || "",
    senderName: (fields.senderName as any)?.stringValue || "",
    recipientEmail: (fields.recipientEmail as any)?.stringValue || "",
    role: (fields.role as any)?.stringValue || "Member",
    status: (fields.status as any)?.stringValue || "pending",
    timestamp: (fields.timestamp as any)?.stringValue || "",
  };
}

export function encodeInvitation(data: Partial<Invitation>): Record<string, FirestoreValue> {
  return {
    projectId: { stringValue: data.projectId || "" },
    projectName: { stringValue: data.projectName || "" },
    senderId: { stringValue: data.senderId || "" },
    senderName: { stringValue: data.senderName || "" },
    recipientEmail: { stringValue: data.recipientEmail || "" },
    role: { stringValue: data.role || "Member" },
    status: { stringValue: data.status || "pending" },
    timestamp: { stringValue: data.timestamp || new Date().toISOString() },
  };
}

export async function createInvitation(token: string, payload: Partial<Invitation>): Promise<Invitation> {
  const response = await fetch(`${BASE_URL}/${COLLECTION}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields: encodeInvitation(payload) }),
  });

  if (!response.ok) throw new Error("Could not create invitation");
  return toInvitation(await response.json());
}

export async function getPendingInvitations(token: string, email: string): Promise<Invitation[]> {
  const response = await fetch(`${BASE_URL}:runQuery`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: COLLECTION }],
        where: {
          compositeFilter: {
            op: "AND",
            filters: [
              { fieldFilter: { field: { fieldPath: "recipientEmail" }, op: "EQUAL", value: { stringValue: email } } },
              { fieldFilter: { field: { fieldPath: "status" }, op: "EQUAL", value: { stringValue: "pending" } } }
            ]
          }
        }
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Could not fetch invitations");
  const rows = (await response.json()) as Array<{ document?: FirestoreDocument }>;
  return rows.map(r => r.document ? toInvitation(r.document) : null).filter((i): i is Invitation => Boolean(i));
}

export async function updateInvitationStatus(token: string, id: string, status: "accepted" | "declined"): Promise<Invitation> {
  const response = await fetch(`${BASE_URL}/${COLLECTION}/${id}?updateMask.fieldPaths=status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields: { status: { stringValue: status } } }),
  });

  if (!response.ok) throw new Error("Could not update invitation");
  return toInvitation(await response.json());
}

export async function getInvitation(token: string, id: string): Promise<Invitation> {
  const response = await fetch(`${BASE_URL}/${COLLECTION}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not load invitation");
  return toInvitation(await response.json());
}
