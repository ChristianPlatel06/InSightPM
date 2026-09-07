import json from "@/lib/json";
import { requireUser } from "@/lib/auth-server";
import { createProject, listProjects } from "@/lib/projects";
import { PROJECT_STATUSES, type ProjectStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if ("error" in auth) return json({ success: false, error: auth.error }, auth.status);

  try {
    const projects = await listProjects(auth.token, auth.user.uid);
    return json({ success: true, projects });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return json({ success: false, error: message }, 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if ("error" in auth) return json({ success: false, error: auth.error }, auth.status);

  try {
    const body = (await request.json()) as {
      name?: string;
      description?: string;
      owner?: string;
      status?: ProjectStatus;
      progress?: number;
      dueDate?: string | null;
    };

    const name = body.name?.trim() ?? "";
    if (!name) {
      return json({ success: false, error: "Project name is required" }, 400);
    }

    if (body.status && !PROJECT_STATUSES.includes(body.status)) {
      return json({ success: false, error: "Invalid status" }, 400);
    }

    const project = await createProject(auth.token, auth.user.uid, {
      name,
      description: body.description,
      owner: body.owner?.trim() || auth.user.name || auth.user.email || "",
      status: body.status,
      progress: body.progress,
      dueDate: body.dueDate,
    });

    return json({ success: true, id: project.id, name: project.name, project }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return json({ success: false, error: message }, 500);
  }
}
