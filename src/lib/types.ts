export const PROJECT_STATUSES = [
  "Planned",
  "In Progress",
  "At Risk",
  "Delayed",
  "Completed",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export type UserProfile = {
  uid: string;
  displayName: string;
  email: string;
  avatar: string;
  roleTitle: string;
  skills: string[];
  createdAt: string;
};

export type ProjectMember = {
  uid: string;
  name: string;
  email: string;
  role: string;
  skills: string[];
  completion: number;
};

export type Invitation = {
  id: string;
  projectId: string;
  projectName: string;
  senderId: string;
  senderName: string;
  recipientEmail: string;
  role: string;
  status: "pending" | "accepted" | "declined";
  timestamp: string;
};

export type ActivityLog = {
  id: string;
  description: string;
  timestamp: string;
};

export type AiTeamPlan = {
  allocations: {
    uid: string;
    name: string;
    ownershipPercentage: number;
    tasks: string[];
  }[];
  teamRecommendations: string[];
  missingSkillsWarnings: string[];
  generatedAt: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  owner: string; // Legacy display string, keeping to not break old UI
  ownerId: string;
  memberIds: string[];
  members: ProjectMember[];
  status: ProjectStatus;
  progress: number;
  dueDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  aiCompletionProbability: string | null;
  aiTopRisks: string[] | null;
  aiRecommendedActions: string[] | null;
  aiSuggestedPriorities: string[] | null;
  aiTeamPlan: AiTeamPlan | null;
  activities: ActivityLog[];
};

export type ProjectInput = {
  name: string;
  description?: string;
  owner?: string;
  status?: ProjectStatus;
  progress?: number;
  dueDate?: string | null;
  memberIds?: string[];
  members?: ProjectMember[];
  aiCompletionProbability?: string | null;
  aiTopRisks?: string[] | null;
  aiRecommendedActions?: string[] | null;
  aiSuggestedPriorities?: string[] | null;
  aiTeamPlan?: AiTeamPlan | null;
  activities?: ActivityLog[];
};

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export type RiskAssessment = {
  score: number;
  level: RiskLevel;
  color: string;
  explanation: string;
};
