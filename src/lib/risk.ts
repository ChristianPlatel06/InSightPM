import type { Project, RiskAssessment } from "@/lib/types";

/** Format an ISO date string (YYYY-MM-DD) as DD/MM/YYYY for display */
export function formatIndianDate(iso: string | null | undefined): string {
  if (!iso) return "Not set";
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return iso;
  return `${match[3]}/${match[2]}/${match[1]}`;
}

/** Calculate days remaining (positive) or overdue (negative) from an ISO date */
export function calculateDaysRemaining(dueDate: string | null | undefined): number | null {
  if (!dueDate) return null;
  const match = dueDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const dueUTC = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const now = new Date();
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor((dueUTC - todayUTC) / 86400000);
}

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

  // Progress baseline — remaining work as risk
  const remaining = Math.max(0, 100 - project.progress);
  score += remaining;

  // Status modifiers
  if (project.status === "Delayed") score += 30;
  if (project.status === "At Risk") score += 20;

  // Due date modifier
  let explanation = "Project is tracking smoothly.";
  const daysLeft = calculateDaysRemaining(project.dueDate);

  if (daysLeft === null) {
    explanation = "No due date set, making progress hard to track.";
    score += 10;
  } else if (daysLeft < 0) {
    const overdueDays = Math.abs(daysLeft);
    score += 50;
    explanation = `Project is overdue by ${overdueDays} day${overdueDays !== 1 ? "s" : ""}.`;
  } else if (daysLeft === 0) {
    if (project.progress < 90) score += 45;
    explanation = "Deadline is today!";
  } else if (daysLeft <= 3) {
    if (project.progress < 80) score += 40;
    explanation = `Critically close to deadline with ${remaining}% remaining.`;
  } else if (daysLeft <= 7) {
    if (project.progress < 60) score += 25;
    explanation = `Deadline approaching with ${remaining}% remaining.`;
  } else if (daysLeft > 14 && project.progress < 10) {
    explanation = "Early phases, plenty of runway.";
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
