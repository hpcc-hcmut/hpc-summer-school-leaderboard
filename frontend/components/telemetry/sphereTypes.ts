export type RunStatus = "completed" | "running" | "pending" | "failed";

export type TeamSphereNode = {
  teamId: string;
  teamName: string;
  rank: number;
  score: number;
  lastRunStatus: RunStatus;
  runtimeSeconds: number;
  gpuSeconds: number;
  numAgents: number;
};

export type ClusterSphereData = {
  runningJobs: number;
  pendingJobs: number;
  completedRuns: number;
  failedRuns: number;
  teams: TeamSphereNode[];
};
