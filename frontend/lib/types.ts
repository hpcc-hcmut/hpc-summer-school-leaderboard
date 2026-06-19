export interface LeaderboardTeam {
  rank: number;
  team_id: string;
  team_name: string;
  best_score: number;
  correctness: number;
  evidence: number;
  workflow: number;
  efficiency: number;
  runtime_sec: number | null;
  llm_calls: number | null;
  models_used: string[];
  submissions: number;
  last_submit: string;
}

export interface LeaderboardData {
  updated_at: string;
  teams: LeaderboardTeam[];
  sphere?: ClusterSphereData;
}

export type RunStatus = "completed" | "running" | "pending" | "failed";

export interface TeamSphereNode {
  teamId: string;
  teamName: string;
  rank: number;
  score: number;
  lastRunStatus: RunStatus;
  runtimeSeconds: number;
  gpuSeconds: number;
  numAgents: number;
}

export interface ClusterSphereData {
  runningJobs: number;
  pendingJobs: number;
  completedRuns: number;
  failedRuns: number;
  teams: TeamSphereNode[];
}

export interface ScoreBreakdown {
  correctness: number;
  evidence: number;
  workflow: number;
  efficiency: number;
}

export interface QADetailItem {
  question_id: string;
  score: number;
  max_score: number;
  answer_ok: boolean;
  evidence_ok: boolean;
  submitted_evidence_files: string[];
  required_evidence_files: string[];
}

export interface RunDetail {
  submission_id: number;
  team_id: string;
  team_name: string;
  score: number;
  breakdown: ScoreBreakdown;
  workflow_metadata: Record<string, unknown>;
  answer: Record<string, unknown>;
  trace_summary: Record<string, unknown>;
  messages: string[];
  created_at: string;
  status: string;
  legacy_score?: number;
  qa_score?: number;
  final_score?: number;
  qa_details?: QADetailItem[];
}

export interface AdminRunItem {
  submission_id: number;
  team_id: string;
  team_name: string;
  score: number;
  correctness: number;
  evidence: number;
  workflow: number;
  efficiency: number;
  runtime_sec: number | null;
  llm_calls: number | null;
  models_used: string[];
  status: string;
  is_deleted: boolean;
  slurm_job_id: string | null;
  created_at: string;
}

export interface AdminRunsData {
  items: AdminRunItem[];
  total: number;
}
