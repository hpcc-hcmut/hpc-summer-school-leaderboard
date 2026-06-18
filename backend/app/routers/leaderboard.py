import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from ..db import get_session
from ..models import Submission
from ..schemas import LeaderboardResponse, LeaderboardTeam, RunDetailResponse, ScoreBreakdown

router = APIRouter()


@router.get("/api/leaderboard", response_model=LeaderboardResponse)
def get_leaderboard(session: Session = Depends(get_session)):
    # Get best score per team (excluding deleted)
    best_score_subq = (
        select(
            Submission.team_id,
            func.max(Submission.total_score).label("best_score"),
        )
        .where(Submission.is_deleted == 0)
        .group_by(Submission.team_id)
        .subquery()
    )

    # Get all non-deleted submissions
    all_subs = session.exec(
        select(Submission).where(Submission.is_deleted == 0)
    ).all()

    # Aggregate per team
    team_data: dict[str, dict] = {}
    for sub in all_subs:
        tid = sub.team_id
        if tid not in team_data:
            team_data[tid] = {
                "team_id": tid,
                "team_name": sub.team_name,
                "best_score": 0.0,
                "correctness": 0.0,
                "evidence": 0.0,
                "workflow": 0.0,
                "efficiency": 0.0,
                "runtime_sec": None,
                "llm_calls": None,
                "models_used": [],
                "submissions": 0,
                "last_submit": "",
                "best_sub_time": "",
            }

        td = team_data[tid]
        td["submissions"] += 1
        if sub.created_at > td["last_submit"]:
            td["last_submit"] = sub.created_at

        if sub.total_score > td["best_score"]:
            td["best_score"] = sub.total_score
            td["correctness"] = sub.correctness_score
            td["evidence"] = sub.evidence_score
            td["workflow"] = sub.workflow_score
            td["efficiency"] = sub.efficiency_score
            td["runtime_sec"] = sub.runtime_sec
            td["llm_calls"] = sub.llm_calls
            td["best_sub_time"] = sub.created_at
            try:
                td["models_used"] = json.loads(sub.models_used_json or "[]")
            except Exception:
                td["models_used"] = []

    # Sort: best_score desc, correctness desc, evidence desc, efficiency desc, earlier best time
    sorted_teams = sorted(
        team_data.values(),
        key=lambda t: (
            -t["best_score"],
            -t["correctness"],
            -t["evidence"],
            -t["efficiency"],
            t["best_sub_time"],
        ),
    )

    teams = [
        LeaderboardTeam(
            rank=i + 1,
            team_id=t["team_id"],
            team_name=t["team_name"],
            best_score=t["best_score"],
            correctness=t["correctness"],
            evidence=t["evidence"],
            workflow=t["workflow"],
            efficiency=t["efficiency"],
            runtime_sec=t["runtime_sec"],
            llm_calls=t["llm_calls"],
            models_used=t["models_used"],
            submissions=t["submissions"],
            last_submit=t["last_submit"],
        )
        for i, t in enumerate(sorted_teams)
    ]

    return LeaderboardResponse(
        updated_at=datetime.now(timezone.utc).isoformat(),
        teams=teams,
    )


@router.get("/api/runs/{submission_id}", response_model=RunDetailResponse)
def get_run(submission_id: int, session: Session = Depends(get_session)):
    sub = session.get(Submission, submission_id)
    if not sub or sub.is_deleted:
        raise HTTPException(status_code=404, detail="Run not found")

    return RunDetailResponse(
        submission_id=sub.id,
        team_id=sub.team_id,
        team_name=sub.team_name,
        score=sub.total_score,
        breakdown=ScoreBreakdown(
            correctness=sub.correctness_score,
            evidence=sub.evidence_score,
            workflow=sub.workflow_score,
            efficiency=sub.efficiency_score,
        ),
        workflow_metadata=json.loads(sub.workflow_metadata_json),
        answer=json.loads(sub.answer_json),
        trace_summary=json.loads(sub.trace_summary_json),
        messages=json.loads(sub.messages_json),
        created_at=sub.created_at,
        status=sub.status,
    )
