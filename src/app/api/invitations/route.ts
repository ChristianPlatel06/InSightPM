import json from "@/lib/json";
import { requireUser } from "@/lib/auth-server";
import { createInvitation, getPendingInvitations } from "@/lib/invitations";
import { getProject } from "@/lib/projects";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if ("error" in auth) return json({ success: false, error: auth.error }, auth.status);

  if (!auth.user.email) return json({ success: true, invitations: [] });

  try {
    const invitations = await getPendingInvitations(auth.token, auth.user.email);
    return json({ success: true, invitations });
  } catch (error) {
    return json({ success: false, error: "Failed to fetch" }, 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if ("error" in auth) return json({ success: false, error: auth.error }, auth.status);

  try {
    const body = await request.json();
    const { projectId, recipientEmail, role } = body;

    if (!projectId || !recipientEmail || !role) {
      return json({ success: false, error: "Missing fields" }, 400);
    }

    // Verify sender owns or is member of project
    const project = await getProject(auth.token, auth.user.uid, projectId);
    if (!project) return json({ success: false, error: "Project not found or unauthorized" }, 404);

    const isOwner = project.members.find(m => m.uid === auth.user.uid && m.role === "Owner");
    if (!isOwner) return json({ success: false, error: "Only owners can invite" }, 403);

    const invite = await createInvitation(auth.token, {
      projectId,
      projectName: project.name,
      senderId: auth.user.uid,
      senderName: auth.user.name || auth.user.email || "Unknown",
      recipientEmail,
      role,
      status: "pending",
      timestamp: new Date().toISOString(),
    });

    return json({ success: true, invitation: invite }, 201);
  } catch (error) {
    return json({ success: false, error: "Failed to create" }, 500);
  }
}
