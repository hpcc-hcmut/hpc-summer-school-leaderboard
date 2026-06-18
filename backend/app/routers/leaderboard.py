import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from ..db import get_session
from ..models import Submission
from ..schemas import (
    LeaderboardResponse,
    LeaderboardTeam,
    RunDetailResponse,
    ScoreBreakdown,
    PublicLeaderboardResponse,
    ClusterSphereData,
    TeamSphereNode,
)

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


@router.get("/api/public/leaderboard", response_model=PublicLeaderboardResponse)
def get_public_leaderboard(session: Session = Depends(get_session)):
    lead = get_leaderboard(session)
    teams = lead.teams

    all_subs = session.exec(
        select(Submission).where(Submission.is_deleted == 0)
    ).all()

    latest_sub_status = {}
    for sub in all_subs:
        tid = sub.team_id
        if tid not in latest_sub_status or sub.created_at > latest_sub_status[tid]["created_at"]:
            latest_sub_status[tid] = {
                "created_at": sub.created_at,
                "status": sub.status,
                "num_agents": sub.num_agents or 1,
            }

    # Simulate dynamic running/pending status based on timestamp
    import time
    now_ts = int(time.time())
    running_idx = (now_ts // 20) % max(1, len(teams)) if teams else -1
    pending_idx = ((now_ts // 20) + 1) % max(1, len(teams)) if teams else -1
    if running_idx == pending_idx and len(teams) > 1:
        pending_idx = (pending_idx + 1) % len(teams)

    running_jobs = 0
    pending_jobs = 0
    completed_runs = 0
    failed_runs = 0

    for sub in all_subs:
        if sub.status == "scored":
            completed_runs += 1
        else:
            failed_runs += 1

    sphere_teams = []
    for i, t in enumerate(teams):
        status = "failed" if latest_sub_status.get(t.team_id, {}).get("status") == "error" else "completed"

        if i == running_idx:
            status = "running"
            running_jobs += 1
        elif i == pending_idx:
            status = "pending"
            pending_jobs += 1

        runtime = t.runtime_sec or 0.0
        num_agents = latest_sub_status.get(t.team_id, {}).get("num_agents", 1)
        gpu_seconds = runtime * num_agents

        sphere_teams.append(TeamSphereNode(
            teamId=t.team_id,
            teamName=t.team_name,
            rank=t.rank,
            score=t.best_score,
            lastRunStatus=status,
            runtimeSeconds=runtime,
            gpuSeconds=gpu_seconds,
            numAgents=num_agents,
        ))

    sphere_data = ClusterSphereData(
        runningJobs=running_jobs,
        pendingJobs=pending_jobs,
        completedRuns=completed_runs,
        failedRuns=failed_runs,
        teams=sphere_teams,
    )

    return PublicLeaderboardResponse(
        updated_at=lead.updated_at,
        sphere=sphere_data,
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
