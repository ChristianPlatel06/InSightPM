import json from "@/lib/json";
import { requireUser } from "@/lib/auth-server";
import { getProject, removeProject, updateProject } from "@/lib/projects";
import { PROJECT_STATUSES, type ProjectStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireUser(request);
  if ("error" in auth) return json({ success: false, error: auth.error }, auth.status);

  try {
    const { id } = await context.params;
    const project = await getProject(auth.token, auth.user.uid, id);
    if (!project) {
      return json({ success: false, error: "Project not found" }, 404);
    }
    return json({ success: true, project });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return json({ success: false, error: message }, 500);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireUser(request);
  if ("error" in auth) return json({ success: false, error: auth.error }, auth.status);

  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      name?: string;
      description?: string;
      owner?: string;
      status?: ProjectStatus;
      progress?: number;
      dueDate?: string | null;
      memberIds?: string[];
      members?: any[];
      activities?: any[];
    };

    if (body.status && !PROJECT_STATUSES.includes(body.status)) {
      return json({ success: false, error: "Invalid status" }, 400);
    }

    const project = await updateProject(auth.token, auth.user.uid, id, body);
    if (!project) {
      return json({ success: false, error: "Project not found" }, 404);
    }

    return json({ success: true, project });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return json({ success: false, error: message }, 500);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireUser(request);
  if ("error" in auth) return json({ success: false, error: auth.error }, auth.status);

  try {
    const { id } = await context.params;
    const deleted = await removeProject(auth.token, auth.user.uid, id);
    if (!deleted) {
      return json({ success: false, error: "Project not found" }, 404);
    }
    return json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return json({ success: false, error: message }, 500);
  }
}
