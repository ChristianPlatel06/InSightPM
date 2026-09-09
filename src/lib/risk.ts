import type { Project, RiskAssessment } from "@/lib/types";

export function calculateRiskAssessment(project: Project): RiskAssessment {
  if (project.status === "Completed") {
    return {
      score: 0,
      level: "Low",
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      explanation: "Project is successfully completed.",
    };
  }

  let score = 0;
  
  // Progress baseline
  score += Math.max(0, 100 - project.progress);

  // Status modifiers
  if (project.status === "Delayed") score += 30;
  if (project.status === "At Risk") score += 20;

  // Due date modifier
  let explanation = "Project is tracking smoothly.";
  if (project.dueDate) {
    // Parse dueDate as UTC strictly to avoid timezone shift
    // project.dueDate is expected to be "YYYY-MM-DD"
    const [year, month, day] = project.dueDate.split("-").map(Number);
    if (year && month && day) {
      const dueUTC = Date.UTC(year, month - 1, day);
      const now = new Date();
      const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
      
      const daysLeft = Math.floor((dueUTC - todayUTC) / 86400000);
      
      if (daysLeft < 0) {
        score += 50; // Overdue
        explanation = `Project is overdue by ${Math.abs(daysLeft)} days.`;
      } else if (daysLeft === 0) {
        if (project.progress < 90) score += 45;
        explanation = `Deadline is today!`;
      } else if (daysLeft <= 3) {
        if (project.progress < 80) score += 40;
        explanation = `Critically close to deadline with ${100 - project.progress}% remaining.`;
      } else if (daysLeft <= 7) {
        if (project.progress < 60) score += 25;
        explanation = "Deadline approaching; progress is lagging.";
      } else if (daysLeft > 14 && project.progress < 10) {
        explanation = "Early phases, plenty of runway.";
      }
    } else {
      explanation = "Invalid due date format.";
      score += 10;
    }
  } else {
    explanation = "No due date set, making progress hard to track.";
    score += 10;
  }

  score = Math.min(100, Math.max(0, score));

  if (score >= 75) {
    return { score, level: "Critical", color: "bg-rose-500/10 text-rose-400 border-rose-500/20", explanation };
  } else if (score >= 50) {
    return { score, level: "High", color: "bg-orange-500/10 text-orange-400 border-orange-500/20", explanation };
  } else if (score >= 25) {
    return { score, level: "Medium", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", explanation };
  } else {
    return { score, level: "Low", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", explanation };
  }
}
