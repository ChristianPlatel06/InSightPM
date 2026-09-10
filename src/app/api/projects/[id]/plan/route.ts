import json from "@/lib/json";
import { requireUser } from "@/lib/auth-server";
import { getProject, updateProject } from "@/lib/projects";
import { GoogleGenAI } from "@google/genai";
import { calculateRiskAssessment } from "@/lib/risk";

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request);
  if ("error" in auth) return json({ success: false, error: auth.error }, auth.status);

  try {
    const { id } = await context.params;
    const project = await getProject(auth.token, auth.user.uid, id);
    if (!project) return json({ success: false, error: "Not found" }, 404);

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return json({ success: false, error: "API configuration key is missing. Please set GEMINI_API_KEY in your environment variables." }, 500);
    }
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    const risk = calculateRiskAssessment(project);

    const systemInstruction = `You are an elite Agile Project Manager and AI Resource Planner.
Given the project details and the team's skills, generate a JSON response to distribute workload efficiently.
Return ONLY valid JSON matching this schema:
{
  "allocations": [
    {
      "uid": "string",
      "name": "string",
      "ownershipPercentage": number,
      "tasks": ["string", "string"]
    }
  ],
  "teamRecommendations": ["string", "string"],
  "missingSkillsWarnings": ["string"]
}
`;

    const prompt = `
Project Name: ${project.name}
Description: ${project.description || "No description"}
Progress: ${project.progress}%
Risk Level: ${risk.level}
Due Date: ${project.dueDate || "No due date"}

Team Members:
${project.members.map(m => `- ${m.name} (${m.role}): Skills - ${m.skills.join(", ") || "None listed"}`).join("\n")}

Distribute the remaining workload based on member roles and skills.
Ensure ownershipPercentage totals exactly 100%.
`;

    let response;
    const retries = 3;
    let attempt = 0;
    
    while (attempt < retries) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
          }
        });
        break; // Success, exit retry loop
      } catch (error: unknown) {
        attempt++;
        const err = error as any;
        const status = err?.status || err?.response?.status;
        const message = err?.message || "";
        
        if (status === 503 || message.includes("503") || message.includes("UNAVAILABLE") || message.includes("high demand")) {
          if (attempt >= retries) {
            return json({ success: false, error: "Gemini is currently experiencing high demand. Please try again in a few moments." }, 503);
          }
          console.warn(`Gemini API 503 error. Retrying attempt ${attempt} of ${retries}...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        } else {
          throw error;
        }
      }
    }

    if (!response || !response.text) {
      return json({ success: false, error: "Empty AI response" }, 500);
    }

    const aiPlan = JSON.parse(response.text);
    aiPlan.generatedAt = new Date().toISOString();

    const newActivity = { id: Date.now().toString(), description: `${auth.user.name || "A member"} generated an AI Team Plan`, timestamp: new Date().toISOString() };
    const activities = [newActivity, ...(project.activities || [])].slice(0, 50);

    const updated = await updateProject(auth.token, auth.user.uid, id, {
      aiTeamPlan: aiPlan,
      activities
    });

    return json({ success: true, aiTeamPlan: aiPlan, project: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    // Avoid raw JSON strings in UI
    if (message.includes("{") && message.includes("}")) {
      return json({ success: false, error: "An unexpected error occurred while communicating with the AI service." }, 500);
    }
    return json({ success: false, error: message }, 500);
  }
}
