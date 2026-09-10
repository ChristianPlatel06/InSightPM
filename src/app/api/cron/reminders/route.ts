import { NextResponse } from "next/server";
import { Resend } from "resend";
import { GoogleGenAI } from "@google/genai";
import { listAllProjectsForCron } from "@/lib/projects";
import { calculateRiskAssessment } from "@/lib/risk";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // 1. Verify Vercel Cron Secret
    const authHeader = request.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Initialize APIs
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY is not set. Skipping email dispatch.");
      return NextResponse.json({ success: false, error: "Missing RESEND API key" }, { status: 500 });
    }
    const resend = new Resend(resendApiKey);

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

    // 3. Fetch Projects
    const projects = await listAllProjectsForCron();
    const now = new Date();
    
    // Filter to projects due within exactly the next 24 hours (UTC)
    const upcomingDeadlines = projects.filter((project) => {
      if (!project.dueDate || project.status === "Completed") return false;
      const [y, m, d] = project.dueDate.split("-").map(Number);
      if (!y || !m || !d) return false;
      
      const dueUTC = Date.UTC(y, m - 1, d);
      const timeDiff = dueUTC - now.getTime();
      const hoursLeft = timeDiff / (1000 * 3600);
      return hoursLeft >= 0 && hoursLeft <= 24;
    });

    if (upcomingDeadlines.length === 0) {
      return NextResponse.json({ success: true, message: "No upcoming deadlines." });
    }

    const results = [];

    // 4. Process each project
    for (const project of upcomingDeadlines) {
      const risk = calculateRiskAssessment(project);
      let aiRecommendation = "Complete your remaining tasks today.";

      if (ai) {
        try {
          const prompt = `
            A project titled "${project.name}" is due in less than 24 hours.
            Current progress: ${project.progress}%.
            Risk level: ${risk.level}.
            
            Write a 2-sentence encouraging but urgent recommendation for the project owner to ensure they meet the deadline.
          `;
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
          });
          if (response.text) {
            aiRecommendation = response.text.replace(/\n/g, ' ').trim();
          }
        } catch (e) {
          console.error("AI Generation failed for cron:", e);
        }
      }

      // Send Email
      const { data, error } = await resend.emails.send({
        from: "InSightPM <onboarding@resend.dev>",
        to: [project.owner || "delivered@resend.dev"], // Fallback if owner email is missing
        subject: `⚠️ Deadline Approaching: ${project.name}`,
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
            <h1 style="color: #1e293b;">InSightPM Alert</h1>
            <p>Hello,</p>
            <p>Your project <strong>${project.name}</strong> is due in less than 24 hours.</p>
            
            <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; margin: 24px 0;">
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 8px;"><strong>Progress:</strong> ${project.progress}%</li>
                <li style="margin-bottom: 8px;"><strong>Status:</strong> ${project.status}</li>
                <li><strong>Risk Score:</strong> ${risk.score}/100 (${risk.level})</li>
              </ul>
            </div>

            <h3 style="color: #1e293b;">AI Recommendation</h3>
            <p style="font-style: italic; color: #475569;">"${aiRecommendation}"</p>

            <p style="margin-top: 32px; font-size: 14px; color: #94a3b8;">
              Log in to InSightPM to update your progress or adjust your deadline.
            </p>
          </div>
        `,
      });

      results.push({ projectId: project.id, emailData: data, emailError: error });
    }

    return NextResponse.json({ success: true, processed: upcomingDeadlines.length, results });
  } catch (error: unknown) {
    const err = error as any;
    console.error("CRON Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
