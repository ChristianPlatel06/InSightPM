import type { Project, ProjectInput } from "@/lib/types";

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string; success?: boolean };
  if (!res.ok || data.success === false) {
    throw new Error(data.error ?? "Request failed");
  }
  return data;
}

function request(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, { cache: "no-store", credentials: "include", ...init });
}

export async function fetchProjects(): Promise<Project[]> {
  const data = await parseJson<{ projects: Project[] }>(await request("/api/projects"));
  return data.projects;
}

export async function fetchProject(id: string): Promise<Project> {
  const data = await parseJson<{ project: Project }>(
    await request(`/api/projects/${id}`),
  );
  return data.project;
}

export async function postProject(input: ProjectInput): Promise<Project> {
  const data = await parseJson<{ project: Project }>(
    await request("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
  return data.project;
}

export async function patchProject(
  id: string,
  input: Partial<ProjectInput>,
): Promise<Project> {
  const data = await parseJson<{ project: Project }>(
    await request(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
  return data.project;
}

export async function deleteProject(id: string): Promise<void> {
  await parseJson<{ success: boolean }>(
    await request(`/api/projects/${id}`, { method: "DELETE" }),
  );
}

export async function analyzeProject(id: string, updateText: string): Promise<Project> {
  const data = await parseJson<{ project: Project }>(
    await request(`/api/projects/${id}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updateText }),
    }),
  );
  return data.project;
}
