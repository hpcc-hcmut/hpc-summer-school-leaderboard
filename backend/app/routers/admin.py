import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func
from ..db import get_session
from ..models import Submission
from ..schemas import (
    AdminLoginRequest,
    AdminTokenResponse,
    AdminRunItem,
    AdminRunsResponse,
)
from ..auth import verify_admin_password, create_admin_jwt, get_current_admin

router = APIRouter()


@router.post("/api/admin/login", response_model=AdminTokenResponse)
def admin_login(body: AdminLoginRequest):
    if not verify_admin_password(body.password):
        raise HTTPException(status_code=401, detail="Invalid admin password")
    token = create_admin_jwt()
    return AdminTokenResponse(access_token=token)


@router.get("/api/admin/runs", response_model=AdminRunsResponse)
def admin_list_runs(
    team_id: str | None = Query(default=None),
    include_deleted: bool = Query(default=False),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    session: Session = Depends(get_session),
    _admin: str = Depends(get_current_admin),
):
    query = select(Submission)
    count_query = select(func.count()).select_from(Submission)

    if team_id:
        query = query.where(Submission.team_id == team_id)
        count_query = count_query.where(Submission.team_id == team_id)
    if not include_deleted:
        query = query.where(Submission.is_deleted == 0)
        count_query = count_query.where(Submission.is_deleted == 0)

    total = session.exec(count_query).one()
    subs = session.exec(query.order_by(Submission.created_at.desc()).limit(limit).offset(offset)).all()

    items = [
        AdminRunItem(
            submission_id=s.id,
            team_id=s.team_id,
            team_name=s.team_name,
            score=s.total_score,
            correctness=s.correctness_score,
            evidence=s.evidence_score,
            workflow=s.workflow_score,
            efficiency=s.efficiency_score,
            runtime_sec=s.runtime_sec,
            llm_calls=s.llm_calls,
            models_used=json.loads(s.models_used_json or "[]"),
            status=s.status,
            is_deleted=bool(s.is_deleted),
            slurm_job_id=s.slurm_job_id,
            created_at=s.created_at,
        )
        for s in subs
    ]

    return AdminRunsResponse(items=items, total=total)


@router.delete("/api/admin/runs/{submission_id}")
def admin_delete_run(
    submission_id: int,
    session: Session = Depends(get_session),
    _admin: str = Depends(get_current_admin),
):
    sub = session.get(Submission, submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    sub.is_deleted = 1
    session.add(sub)
    session.commit()
    return {"ok": True, "submission_id": submission_id, "deleted": True}


@router.post("/api/admin/runs/{submission_id}/restore")
def admin_restore_run(
    submission_id: int,
    session: Session = Depends(get_session),
    _admin: str = Depends(get_current_admin),
):
    sub = session.get(Submission, submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    sub.is_deleted = 0
    session.add(sub)
    session.commit()
    return {"ok": True, "submission_id": submission_id, "restored": True}
