import { firebaseProjectId } from "@/lib/firebase-config";
import {
  PROJECT_STATUSES,
  type Project,
  type ProjectInput,
  type ProjectStatus,
} from "@/lib/types";

const COLLECTION = "projects";
export const BASE_URL = `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents`;

export type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: "NULL_VALUE" }
  | { arrayValue: { values: FirestoreValue[] } }
  | { mapValue: { fields: Record<string, FirestoreValue> } };

export interface FirestoreDocument {
  name?: string;
  fields?: Record<string, FirestoreValue>;
  createTime?: string;
  updateTime?: string;
}

function asStatus(value: string): ProjectStatus {
  if (PROJECT_STATUSES.includes(value as ProjectStatus)) {
    return value as ProjectStatus;
  }
  return "In Progress";
}

function asProgress(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function str(fields: Record<string, FirestoreValue> | undefined, key: string): string {
  const value = fields?.[key];
  if (value && "stringValue" in value) return value.stringValue;
  return "";
}

function num(fields: Record<string, FirestoreValue> | undefined, key: string): number {
  const value = fields?.[key];
  if (value && "integerValue" in value) return Number(value.integerValue);
  return 0;
}

function nullable(fields: Record<string, FirestoreValue> | undefined, key: string): string | null {
  const value = fields?.[key];
  if (!value) return null;
  if ("nullValue" in value) return null;
  if ("stringValue" in value) return value.stringValue || null;
  return null;
}

function docId(name: string | undefined): string {
  if (!name) return "";
  return name.split("/").pop() ?? "";
}

function strArray(fields: Record<string, FirestoreValue> | undefined, key: string): string[] | null {
  const value = fields?.[key] as any;
  if (!value || !value.arrayValue || !value.arrayValue.values) return null;
  return value.arrayValue.values.map((v: any) => v.stringValue || "");
}

export function toProject(doc: FirestoreDocument): Project {
  const fields = doc.fields || {};
  return {
    id: doc.name?.split("/").pop() || "",
    name: str(fields, "name"),
    description: str(fields, "description"),
    owner: str(fields, "owner"),
    ownerId: str(fields, "ownerId"),
    memberIds: strArray(fields, "memberIds") || [],
    members: (fields.members as any)?.stringValue ? JSON.parse((fields.members as any).stringValue) : [],
    status: asStatus(str(fields, "status")),
    progress: asProgress(num(fields, "progress")),
    dueDate: nullable(fields, "dueDate"),
    createdAt: nullable(fields, "createdAt"),
    updatedAt: nullable(fields, "updatedAt"),
    aiCompletionProbability: nullable(fields, "aiCompletionProbability"),
    aiTopRisks: strArray(fields, "aiTopRisks"),
    aiRecommendedActions: strArray(fields, "aiRecommendedActions"),
    aiSuggestedPriorities: strArray(fields, "aiSuggestedPriorities"),
    aiTeamPlan: (fields.aiTeamPlan as any)?.stringValue ? JSON.parse((fields.aiTeamPlan as any).stringValue) : null,
    activities: (fields.activities as any)?.stringValue ? JSON.parse((fields.activities as any).stringValue) : [],
  };
}

export function encode(data: {
  name: string;
  description: string;
  owner: string;
  ownerId: string;
  memberIds?: string[];
  members?: any[];
  status: ProjectStatus;
  progress: number;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  aiCompletionProbability?: string | null;
  aiTopRisks?: string[] | null;
  aiRecommendedActions?: string[] | null;
  aiSuggestedPriorities?: string[] | null;
  aiTeamPlan?: any | null;
  activities?: any[];
}): Record<string, FirestoreValue> {
  return {
    name: { stringValue: data.name },
    description: { stringValue: data.description },
    owner: { stringValue: data.owner },
    ownerId: { stringValue: data.ownerId },
    status: { stringValue: data.status },
    progress: { integerValue: String(data.progress) },
    dueDate: data.dueDate ? { stringValue: data.dueDate } : { nullValue: "NULL_VALUE" },
    createdAt: { stringValue: data.createdAt },
    updatedAt: { stringValue: data.updatedAt },
    ...(data.memberIds !== undefined && {
      memberIds: data.memberIds ? { arrayValue: { values: data.memberIds.map(a => ({ stringValue: a })) } } as any : { nullValue: "NULL_VALUE" }
    }),
    ...(data.members !== undefined && {
      members: { stringValue: JSON.stringify(data.members) }
    }),
    ...(data.aiCompletionProbability !== undefined && { 
      aiCompletionProbability: data.aiCompletionProbability ? { stringValue: data.aiCompletionProbability } : { nullValue: "NULL_VALUE" } 
    }),
    ...(data.aiTopRisks !== undefined && { 
      aiTopRisks: data.aiTopRisks ? { arrayValue: { values: data.aiTopRisks.map(a => ({ stringValue: a })) } } as any : { nullValue: "NULL_VALUE" } 
    }),
    ...(data.aiRecommendedActions !== undefined && { 
      aiRecommendedActions: data.aiRecommendedActions ? { arrayValue: { values: data.aiRecommendedActions.map(a => ({ stringValue: a })) } } as any : { nullValue: "NULL_VALUE" } 
    }),
    ...(data.aiSuggestedPriorities !== undefined && { 
      aiSuggestedPriorities: data.aiSuggestedPriorities ? { arrayValue: { values: data.aiSuggestedPriorities.map(a => ({ stringValue: a })) } } as any : { nullValue: "NULL_VALUE" } 
    }),
    ...(data.aiTeamPlan !== undefined && {
      aiTeamPlan: { stringValue: JSON.stringify(data.aiTeamPlan) }
    }),
    ...(data.activities !== undefined && {
      activities: { stringValue: JSON.stringify(data.activities) }
    }),
  };
}

async function firestoreFetch(token: string, url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}

export async function listProjects(token: string, uid: string): Promise<Project[]> {
  const response = await firestoreFetch(token, `${BASE_URL}:runQuery`, {
    method: "POST",
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: COLLECTION }],
        where: {
          fieldFilter: {
            field: { fieldPath: "memberIds" },
            op: "ARRAY_CONTAINS",
            value: { stringValue: uid },
          },
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Could not load projects");
  }

  const rows = (await response.json()) as Array<{ document?: FirestoreDocument }>;
  return rows
    .map((row) => (row.document ? toProject(row.document) : null))
    .filter((project): project is Project => Boolean(project && (project.memberIds.includes(uid) || project.ownerId === uid)))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export async function listAllProjectsForCron(): Promise<Project[]> {
  const response = await fetch(`${BASE_URL}:runQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: COLLECTION }],
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not load projects for cron");
  }

  const rows = (await response.json()) as Array<{ document?: FirestoreDocument }>;
  return rows
    .map((row) => (row.document ? toProject(row.document) : null))
    .filter((project): project is Project => Boolean(project));
}

export async function getProject(
  token: string,
  uid: string,
  id: string,
): Promise<Project | null> {
  const response = await firestoreFetch(token, `${BASE_URL}/${COLLECTION}/${id}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Could not load project");

  const project = toProject((await response.json()) as FirestoreDocument);
  if (!project.memberIds.includes(uid) && project.ownerId !== uid) return null;
  return project;
}

export async function createProject(
  token: string,
  uid: string,
  input: ProjectInput,
): Promise<Project> {
  const now = new Date().toISOString();
  const payload = {
    name: input.name.trim(),
    description: input.description?.trim() ?? "",
    owner: input.owner?.trim() ?? "",
    ownerId: uid,
    memberIds: input.memberIds || [uid],
    members: input.members || [],
    status: input.status ?? "Planned",
    progress: asProgress(input.progress ?? 0),
    dueDate: input.dueDate || null,
    createdAt: now,
    updatedAt: now,
  };

  const response = await firestoreFetch(token, `${BASE_URL}/${COLLECTION}`, {
    method: "POST",
    body: JSON.stringify({ fields: encode(payload) }),
  });

  if (!response.ok) {
    throw new Error("Could not create project");
  }

  return toProject((await response.json()) as FirestoreDocument);
}

export async function updateProject(
  token: string,
  uid: string,
  id: string,
  input: Partial<ProjectInput>,
): Promise<Project | null> {
  const existing = await getProject(token, uid, id);
  if (!existing) return null;

  const next = {
    name: input.name !== undefined ? input.name.trim() : existing.name,
    description:
      input.description !== undefined ? input.description.trim() : existing.description,
    owner: input.owner !== undefined ? input.owner.trim() : existing.owner,
    ownerId: existing.ownerId,
    memberIds: input.memberIds !== undefined ? input.memberIds : existing.memberIds,
    members: input.members !== undefined ? input.members : existing.members,
    status: input.status !== undefined ? asStatus(input.status) : existing.status,
    progress:
      input.progress !== undefined ? asProgress(input.progress) : existing.progress,
    dueDate: input.dueDate !== undefined ? input.dueDate || null : existing.dueDate,
    createdAt: existing.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    aiCompletionProbability: input.aiCompletionProbability !== undefined ? input.aiCompletionProbability : existing.aiCompletionProbability,
    aiTopRisks: input.aiTopRisks !== undefined ? input.aiTopRisks : existing.aiTopRisks,
    aiRecommendedActions: input.aiRecommendedActions !== undefined ? input.aiRecommendedActions : existing.aiRecommendedActions,
    aiSuggestedPriorities: input.aiSuggestedPriorities !== undefined ? input.aiSuggestedPriorities : existing.aiSuggestedPriorities,
    aiTeamPlan: input.aiTeamPlan !== undefined ? input.aiTeamPlan : existing.aiTeamPlan,
    activities: input.activities !== undefined ? input.activities : existing.activities,
  };

  const mask = [
    "name",
    "description",
    "owner",
    "memberIds",
    "members",
    "status",
    "progress",
    "dueDate",
    "updatedAt",
    "aiCompletionProbability",
    "aiTopRisks",
    "aiRecommendedActions",
    "aiSuggestedPriorities",
    "aiTeamPlan",
    "activities"
  ]
    .map((field) => `updateMask.fieldPaths=${field}`)
    .join("&");

  const response = await firestoreFetch(
    token,
    `${BASE_URL}/${COLLECTION}/${id}?${mask}`,
    {
      method: "PATCH",
      body: JSON.stringify({ fields: encode(next) }),
    },
  );

  if (!response.ok) {
    throw new Error("Could not update project");
  }

  return toProject((await response.json()) as FirestoreDocument);
}

export async function removeProject(
  token: string,
  uid: string,
  id: string,
): Promise<boolean> {
  const existing = await getProject(token, uid, id);
  if (!existing) return false;

  const response = await firestoreFetch(token, `${BASE_URL}/${COLLECTION}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Could not delete project");
  }

  return true;
}
