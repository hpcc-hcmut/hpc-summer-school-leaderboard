from pydantic import BaseModel
from typing import Any, Optional


# ---- Submission request sub-schemas ----

class TeamInfo(BaseModel):
    team_id: str
    team_name: str
    slurm_job_id: Optional[str] = None


class ModelRole(BaseModel):
    model: str
    roles: list[str]


class WorkflowMetadata(BaseModel):
    workflow_mode: Optional[str] = None
    num_agents: Optional[int] = None
    max_parallel_agents: Optional[int] = None
    models_used: Optional[list[str]] = None
    model_roles: Optional[list[ModelRole]] = None
    has_aggregator: Optional[bool] = False
    has_verifier: Optional[bool] = False
    llm_calls: Optional[int] = None
    runtime_sec: Optional[float] = None
    estimated_input_tokens: Optional[int] = None
    estimated_output_tokens: Optional[int] = None


class EvidenceItem(BaseModel):
    claim: str
    source_file: Optional[str] = None
    artifact_type: Optional[str] = None
    evidence_summary: Optional[str] = None
    confidence: Optional[str] = None


class RepositorySummary(BaseModel):
    main_entrypoint: Optional[str] = None
    workload_type: Optional[str] = None
    framework: Optional[str] = None
    model_family: Optional[str] = None
    dataset_type: Optional[str] = None
    uses_gpu: Optional[bool] = None


class ResourceRecommendation(BaseModel):
    gpu_count: Optional[int] = None
    gpu_memory_class: Optional[str] = None
    cpus_per_task: Optional[int] = None
    system_memory_gb: Optional[int] = None
    time_limit: Optional[str] = None
    slurm_gres: Optional[str] = None
    rationale: Optional[str] = None


class BottleneckAnalysis(BaseModel):
    primary_bottleneck: Optional[str] = None
    cpu: Optional[str] = None
    gpu_compute: Optional[str] = None
    gpu_memory: Optional[str] = None
    storage_io: Optional[str] = None
    network_io: Optional[str] = None
    logging_checkpoint: Optional[str] = None


class QAEvidenceItem(BaseModel):
    file: Optional[str] = None
    lines: Optional[list[int]] = None
    reason: Optional[str] = None


class QASubmittedAnswer(BaseModel):
    question_id: str
    difficulty: Optional[str] = None
    question: Optional[str] = None
    answer: Optional[str] = None
    evidence: Optional[list[QAEvidenceItem]] = None
    confidence: Optional[str] = None


class Answer(BaseModel):
    repository_summary: Optional[RepositorySummary] = None
    resource_recommendation: Optional[ResourceRecommendation] = None
    bottleneck_analysis: Optional[BottleneckAnalysis] = None
    answers: Optional[list[QASubmittedAnswer]] = None
    evidence: Optional[list[EvidenceItem]] = None
    uncertainty: Optional[list[str]] = None
    validation_plan: Optional[list[str]] = None


class AgentTrace(BaseModel):
    agent_name: Optional[str] = None
    role: Optional[str] = None
    model: Optional[str] = None
    calls: Optional[int] = None
    runtime_sec: Optional[float] = None
    input_tokens: Optional[int] = None
    output_tokens: Optional[int] = None


class ParallelGroup(BaseModel):
    name: Optional[str] = None
    agents: Optional[list[str]] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None


class Verification(BaseModel):
    ran: Optional[bool] = False
    issues_found: Optional[int] = 0
    issues_fixed: Optional[int] = 0


class TraceSummary(BaseModel):
    agents: Optional[list[AgentTrace]] = None
    parallel_groups: Optional[list[ParallelGroup]] = None
    verification: Optional[Verification] = None


class SubmissionRequest(BaseModel):
    team: TeamInfo
    workflow_metadata: WorkflowMetadata
    answer: Answer
    trace_summary: Optional[TraceSummary] = None


# ---- Submission response ----

class QADetailItem(BaseModel):
    question_id: str
    score: float
    max_score: float
    answer_ok: bool
    evidence_ok: bool
    submitted_evidence_files: list[str]
    required_evidence_files: list[str]


class ScoreBreakdown(BaseModel):
    correctness: float
    evidence: float
    workflow: float
    efficiency: float


class SubmissionResponse(BaseModel):
    submission_id: int
    valid: bool
    score: float
    rank: int
    breakdown: ScoreBreakdown
    messages: list[str]
    legacy_score: Optional[float] = None
    qa_score: Optional[float] = None
    final_score: Optional[float] = None
    qa_details: Optional[list[QADetailItem]] = None


# ---- Leaderboard ----

class LeaderboardTeam(BaseModel):
    rank: int
    team_id: str
    team_name: str
    best_score: float
    correctness: float
    evidence: float
    workflow: float
    efficiency: float
    runtime_sec: Optional[float]
    llm_calls: Optional[int]
    models_used: list[str]
    submissions: int
    last_submit: str


class LeaderboardResponse(BaseModel):
    updated_at: str
    teams: list[LeaderboardTeam]


# ---- Public Leaderboard / Telemetry Sphere ----

class TeamSphereNode(BaseModel):
    teamId: str
    teamName: str
    rank: int
    score: float
    lastRunStatus: str  # "completed" | "running" | "pending" | "failed"
    runtimeSeconds: float
    gpuSeconds: float
    numAgents: int


class ClusterSphereData(BaseModel):
    runningJobs: int
    pendingJobs: int
    completedRuns: int
    failedRuns: int
    teams: list[TeamSphereNode]


class PublicLeaderboardResponse(BaseModel):
    updated_at: str
    sphere: ClusterSphereData
    teams: list[LeaderboardTeam]


# ---- Run detail ----

class RunDetailResponse(BaseModel):
    submission_id: int
    team_id: str
    team_name: str
    score: float
    breakdown: ScoreBreakdown
    workflow_metadata: Any
    answer: Any
    trace_summary: Any
    messages: list[str]
    created_at: str
    status: str
    legacy_score: Optional[float] = None
    qa_score: Optional[float] = None
    final_score: Optional[float] = None
    qa_details: Optional[list[QADetailItem]] = None


# ---- Admin ----

class AdminLoginRequest(BaseModel):
    password: str


class AdminTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AdminRunItem(BaseModel):
    submission_id: int
    team_id: str
    team_name: str
    score: float
    correctness: float
    evidence: float
    workflow: float
    efficiency: float
    runtime_sec: Optional[float]
    llm_calls: Optional[int]
    models_used: list[str]
    status: str
    is_deleted: bool
    slurm_job_id: Optional[str]
    created_at: str


class AdminRunsResponse(BaseModel):
    items: list[AdminRunItem]
    total: int
