import { GoogleGenAI } from "@google/genai";
import json from "@/lib/json";
import { requireUser } from "@/lib/auth-server";
import { getProject, updateProject } from "@/lib/projects";
import { PROJECT_STATUSES } from "@/lib/types";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireUser(request);
  if ("error" in auth) return json({ success: false, error: auth.error }, auth.status);

  try {
    const { id } = await context.params;
    const body = (await request.json()) as { updateText: string };
    
    if (!body.updateText) {
      return json({ success: false, error: "Missing updateText" }, 400);
    }

    const project = await getProject(auth.token, auth.user.uid, id);
    if (!project) {
      return json({ success: false, error: "Project not found" }, 404);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set in environment variables");
      return json({ success: false, error: "API key configuration missing" }, 500);
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      You are an elite, highly-paid AI Project Advisor.
      Analyze the following project and the user's natural language update.
      
      Project State:
      - Name: ${project.name}
      - Description: ${project.description || "N/A"}
      - Current Status: ${project.status}
      - Current Progress: ${project.progress}%
      - Due Date: ${project.dueDate || "Not set"}

      User Update: "${body.updateText}"

      Tasks:
      1. Recalculate the progress percentage.
      2. Reassess the status (must be exactly one of: ${PROJECT_STATUSES.join(", ")}).
      3. Calculate a "Completion Probability" (e.g., "High", "85%", "Low").
      4. Identify the "Top Risks" (1-3 items).
      5. Provide "Recommended Actions" (1-3 items).
      6. Suggest the "Suggested Priorities" for the team right now (1-3 items).
    `;

    console.log(`Calling Gemini API for project ${id}...`);
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            newProgress: { type: "INTEGER", description: "The updated progress 0-100" },
            newStatus: { 
                type: "STRING", 
                enum: PROJECT_STATUSES.map(s => s),
                description: "The updated status" 
            },
            completionProbability: { type: "STRING", description: "Probability of completing on time" },
            topRisks: { type: "ARRAY", items: { type: "STRING" }, description: "Top risks identified" },
            recommendedActions: { type: "ARRAY", items: { type: "STRING" }, description: "Recommended actions to take" },
            suggestedPriorities: { type: "ARRAY", items: { type: "STRING" }, description: "Suggested priorities for the team" }
          },
          required: ["newProgress", "newStatus", "completionProbability", "topRisks", "recommendedActions", "suggestedPriorities"]
        }
      }
    });

    if (!response.text) {
      throw new Error("AI returned empty response");
    }

    console.log("Received response from Gemini:", response.text);
    const result = JSON.parse(response.text);

    // Update project
    const updatedProject = await updateProject(auth.token, auth.user.uid, id, {
      progress: result.newProgress,
      status: result.newStatus,
      aiCompletionProbability: result.completionProbability,
      aiTopRisks: result.topRisks,
      aiRecommendedActions: result.recommendedActions,
      aiSuggestedPriorities: result.suggestedPriorities,
    });

    return json({ success: true, project: updatedProject });

  } catch (error: unknown) {
    console.error("AI Analysis Error details:", error);
    const errObj = error as any;
    if (errObj && errObj.status === 404) {
      console.error("404 Error: The specified Gemini model might not exist or is deprecated.");
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return json({ success: false, error: message, details: errObj?.message || error }, 500);
  }
}
