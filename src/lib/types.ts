export const PROJECT_STATUSES = [
  "Planned",
  "In Progress",
  "At Risk",
  "Delayed",
  "Completed",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export type Project = {
  id: string;
  name: string;
  description: string;
  owner: string;
  ownerId: string;
  status: ProjectStatus;
  progress: number;
  dueDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ProjectInput = {
  name: string;
  description?: string;
  owner?: string;
  status?: ProjectStatus;
  progress?: number;
  dueDate?: string | null;
};
