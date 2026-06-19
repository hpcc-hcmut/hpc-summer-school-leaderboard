import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlmodel import Session, select, func
from ..db import get_session
from ..models import Team, Submission
from ..schemas import SubmissionRequest, SubmissionResponse, ScoreBreakdown
from ..auth import verify_token
from ..scoring import score_submission
from ..config import settings

router = APIRouter()


def _get_rank(session: Session, score: float) -> int:
    """Return rank of this score (1-based, higher is better)."""
    # Count distinct teams with a better best score
    subq = (
        select(func.max(Submission.total_score).label("best"))
        .where(Submission.is_deleted == 0)
        .group_by(Submission.team_id)
    )
    better = [s for s in session.exec(subq).all() if s > score]
    return len(better) + 1


@router.post("/api/submissions", response_model=SubmissionResponse)
def submit(
    body: SubmissionRequest,
    x_team_id: str = Header(..., alias="X-Team-ID"),
    x_team_token: str = Header(..., alias="X-Team-Token"),
    session: Session = Depends(get_session),
):
    # 1. Verify team identity
    team = session.exec(select(Team).where(Team.team_id == x_team_id)).first()
    if not team:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unknown team ID")
    if not verify_token(x_team_token, team.token_hash):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid team token")
    if body.team.team_id != x_team_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="team.team_id in body does not match X-Team-ID header",
        )

    # 2. Check submission limit
    count = session.exec(
        select(func.count()).where(
            Submission.team_id == x_team_id,
            Submission.is_deleted == 0,
        )
    ).one()
    if count >= settings.max_submissions_per_team:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Maximum {settings.max_submissions_per_team} submissions per team reached",
        )

    # 3. Score
    raw = body.model_dump()
    breakdown, messages = score_submission(raw)

    meta = body.workflow_metadata
    now = datetime.now(timezone.utc).isoformat()

    sub = Submission(
        team_id=x_team_id,
        team_name=body.team.team_name,
        slurm_job_id=body.team.slurm_job_id,
        status="scored",
        is_deleted=0,
        total_score=breakdown["total"],
        correctness_score=breakdown["correctness"],
        evidence_score=breakdown["evidence"],
        workflow_score=breakdown["workflow"],
        efficiency_score=breakdown["efficiency"],
        legacy_score=breakdown["legacy_score"],
        qa_score=breakdown["qa_score"],
        final_score=breakdown["final_score"],
        qa_details_json=json.dumps(breakdown["qa_details"]),
        runtime_sec=meta.runtime_sec,
        llm_calls=meta.llm_calls,
        estimated_input_tokens=meta.estimated_input_tokens,
        estimated_output_tokens=meta.estimated_output_tokens,
        workflow_mode=meta.workflow_mode,
        num_agents=meta.num_agents,
        max_parallel_agents=meta.max_parallel_agents,
        models_used_json=json.dumps(meta.models_used or []),
        model_roles_json=json.dumps([r.model_dump() for r in (meta.model_roles or [])]),
        answer_json=json.dumps(raw.get("answer", {})),
        workflow_metadata_json=json.dumps(raw.get("workflow_metadata", {})),
        trace_summary_json=json.dumps(raw.get("trace_summary") or {}),
        raw_submission_json=json.dumps(raw),
        messages_json=json.dumps(messages),
        created_at=now,
    )
    session.add(sub)
    session.commit()
    session.refresh(sub)

    rank = _get_rank(session, breakdown["total"])

    return SubmissionResponse(
        submission_id=sub.id,
        valid=True,
        score=breakdown["total"],
        rank=rank,
        breakdown=ScoreBreakdown(
            correctness=breakdown["correctness"],
            evidence=breakdown["evidence"],
            workflow=breakdown["workflow"],
            efficiency=breakdown["efficiency"],
        ),
        messages=messages,
        legacy_score=breakdown["legacy_score"],
        qa_score=breakdown["qa_score"],
        final_score=breakdown["final_score"],
        qa_details=breakdown["qa_details"],
    )
