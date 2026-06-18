from typing import Optional
from sqlmodel import SQLModel, Field


class Team(SQLModel, table=True):
    __tablename__ = "teams"

    id: Optional[int] = Field(default=None, primary_key=True)
    team_id: str = Field(index=True, unique=True)
    team_name: str
    token_hash: str
    created_at: str


class Submission(SQLModel, table=True):
    __tablename__ = "submissions"

    id: Optional[int] = Field(default=None, primary_key=True)

    team_id: str = Field(index=True)
    team_name: str
    slurm_job_id: Optional[str] = None

    status: str  # "scored" | "error"
    is_deleted: int = Field(default=0)

    total_score: float = Field(default=0.0)
    correctness_score: float = Field(default=0.0)
    evidence_score: float = Field(default=0.0)
    workflow_score: float = Field(default=0.0)
    efficiency_score: float = Field(default=0.0)

    runtime_sec: Optional[float] = None
    llm_calls: Optional[int] = None
    estimated_input_tokens: Optional[int] = None
    estimated_output_tokens: Optional[int] = None
    workflow_mode: Optional[str] = None
    num_agents: Optional[int] = None
    max_parallel_agents: Optional[int] = None

    models_used_json: Optional[str] = None
    model_roles_json: Optional[str] = None

    answer_json: str
    workflow_metadata_json: str
    trace_summary_json: str
    raw_submission_json: str
    messages_json: str

    created_at: str = Field(index=True)
