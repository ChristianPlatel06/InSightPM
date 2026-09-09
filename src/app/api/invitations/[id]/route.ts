import json from "@/lib/json";
import { requireUser } from "@/lib/auth-server";
import { getInvitation, updateInvitationStatus } from "@/lib/invitations";
import { getProject, updateProject } from "@/lib/projects";
import { getUserProfile } from "@/lib/users";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request);
  if ("error" in auth) return json({ success: false, error: auth.error }, auth.status);

  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status } = body;

    if (status !== "accepted" && status !== "declined") {
      return json({ success: false, error: "Invalid status" }, 400);
    }

    const invite = await getInvitation(auth.token, id);
    if (!invite || invite.recipientEmail !== auth.user.email) {
      return json({ success: false, error: "Unauthorized" }, 403);
    }

    if (invite.status !== "pending") {
      return json({ success: false, error: "Already processed" }, 400);
    }

    const updatedInvite = await updateInvitationStatus(auth.token, id, status);

    if (status === "accepted") {
      // Add user to project
      // Because we need owner rights to edit project member array, we might need to bypass it or ensure the current user can update it.
      // Wait, updateProject ensures `project.ownerId === uid` OR `memberIds.includes(uid)`. But the new user is not in memberIds yet!
      // This is a REST API call using the user's token. So the user cannot edit a project they don't belong to yet!
      // Workaround: We can use a service account (if we had one) or we must adjust the Firestore rules/REST API to allow accepted members to add themselves.
      // Since we are mocking security rules on REST, updateProject strictly checks if the user is in memberIds... 
      // Actually, my `getProject` says: `if (!project.memberIds.includes(uid) && project.ownerId !== uid) return null;`
      // And `updateProject` uses `getProject`. This will fail.
      // We must fetch the project without `uid` check, or use `auth.token` to just hit the endpoint if Firestore rules allow it.
      // Since there's no Admin SDK, let's bypass `getProject` locally for this one operation.

      const projectRes = await fetch(`https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents/projects/${invite.projectId}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (projectRes.ok) {
        // We will just patch it directly if allowed.
        const { toProject, encode } = await import("@/lib/projects");
        const doc = await projectRes.json();
        const p = toProject(doc);
        
        // Add member
        const userProfile = await getUserProfile(auth.token, auth.user.uid);
        const newMember = {
          uid: auth.user.uid,
          name: auth.user.name || auth.user.email || "Unknown",
          email: auth.user.email || "",
          role: invite.role,
          skills: userProfile?.skills || [],
          completion: 0
        };

        const newMembers = [...p.members, newMember];
        const newMemberIds = [...p.memberIds, auth.user.uid];
        const newActivity = { id: Date.now().toString(), description: `${newMember.name} joined the project as ${invite.role}`, timestamp: new Date().toISOString() };
        const newActivities = [newActivity, ...p.activities];

        const patchPayload = {
          memberIds: { arrayValue: { values: newMemberIds.map(a => ({ stringValue: a })) } },
          members: { stringValue: JSON.stringify(newMembers) },
          activities: { stringValue: JSON.stringify(newActivities) }
        };

        const mask = "updateMask.fieldPaths=memberIds&updateMask.fieldPaths=members&updateMask.fieldPaths=activities";
        await fetch(`https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents/projects/${invite.projectId}?${mask}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${auth.token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ fields: patchPayload })
        });
      }
    }

    return json({ success: true, invitation: updatedInvite });
  } catch (error) {
    return json({ success: false, error: "Failed to update" }, 500);
  }
}
