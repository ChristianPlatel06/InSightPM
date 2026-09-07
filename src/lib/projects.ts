import { firebaseProjectId } from "@/lib/firebase-config";
import {
  PROJECT_STATUSES,
  type Project,
  type ProjectInput,
  type ProjectStatus,
} from "@/lib/types";

const COLLECTION = "projects";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents`;

type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { nullValue: "NULL_VALUE" };

type FirestoreDocument = {
  name?: string;
  fields?: Record<string, FirestoreValue>;
};

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

function toProject(doc: FirestoreDocument): Project {
  const fields = doc.fields;
  return {
    id: docId(doc.name),
    name: str(fields, "name"),
    description: str(fields, "description"),
    owner: str(fields, "owner"),
    ownerId: str(fields, "ownerId"),
    status: asStatus(str(fields, "status")),
    progress: asProgress(num(fields, "progress")),
    dueDate: nullable(fields, "dueDate"),
    createdAt: nullable(fields, "createdAt"),
    updatedAt: nullable(fields, "updatedAt"),
  };
}

function encode(data: {
  name: string;
  description: string;
  owner: string;
  ownerId: string;
  status: ProjectStatus;
  progress: number;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
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
            field: { fieldPath: "ownerId" },
            op: "EQUAL",
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
    .filter((project): project is Project => Boolean(project && project.ownerId === uid))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
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
  if (project.ownerId !== uid) return null;
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
    status: input.status !== undefined ? asStatus(input.status) : existing.status,
    progress:
      input.progress !== undefined ? asProgress(input.progress) : existing.progress,
    dueDate: input.dueDate !== undefined ? input.dueDate || null : existing.dueDate,
    createdAt: existing.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mask = [
    "name",
    "description",
    "owner",
    "status",
    "progress",
    "dueDate",
    "updatedAt",
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

  const project = toProject((await response.json()) as FirestoreDocument);
  return project.ownerId === uid ? project : null;
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
