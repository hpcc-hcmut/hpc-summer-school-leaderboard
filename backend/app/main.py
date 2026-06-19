import json
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select, text

from .config import settings
from .db import create_db_and_tables, engine
from .seed import seed_teams
from .models import Submission
from .scoring import score_submission
from .routers import health, submissions, leaderboard, admin


def migrate_db(session: Session):
    """Ensure the new columns exist in the submissions table."""
    result = session.execute(text("PRAGMA table_info(submissions)"))
    columns = [row[1] for row in result.all()]

    new_cols = {
        "legacy_score": "FLOAT",
        "qa_score": "FLOAT",
        "final_score": "FLOAT",
        "qa_details_json": "TEXT",
    }
    for col_name, col_type in new_cols.items():
        if col_name not in columns:
            session.execute(text(f"ALTER TABLE submissions ADD COLUMN {col_name} {col_type}"))
    session.commit()


def _apply_score_to_submission(sub: Submission, breakdown: dict, messages: list[str]) -> None:
    sub.total_score = breakdown["total"]
    sub.legacy_score = breakdown["legacy_score"]
    sub.qa_score = breakdown["qa_score"]
    sub.final_score = breakdown["final_score"]
    sub.qa_details_json = json.dumps(breakdown["qa_details"])
    sub.correctness_score = breakdown["correctness"]
    sub.evidence_score = breakdown["evidence"]
    sub.workflow_score = breakdown["workflow"]
    sub.efficiency_score = breakdown["efficiency"]
    sub.messages_json = json.dumps(messages)


def backfill_submissions(session: Session):
    """Backfill missing scores for existing submissions in the database."""
    statement = select(Submission).where(Submission.final_score == None)
    results = session.exec(statement).all()
    if not results:
        return

    for sub in results:
        try:
            raw = json.loads(sub.raw_submission_json)
            breakdown, messages = score_submission(raw)
            _apply_score_to_submission(sub, breakdown, messages)
            session.add(sub)
        except Exception as e:
            print(f"Failed to backfill submission {sub.id}: {e}")

    session.commit()


def rescore_all_submissions(session: Session):
    """Re-score every non-deleted submission (e.g. after rubric changes)."""
    results = session.exec(select(Submission).where(Submission.is_deleted == 0)).all()
    if not results:
        return

    for sub in results:
        try:
            raw = json.loads(sub.raw_submission_json)
            breakdown, messages = score_submission(raw)
            _apply_score_to_submission(sub, breakdown, messages)
            session.add(sub)
        except Exception as e:
            print(f"Failed to rescore submission {sub.id}: {e}")

    session.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    with Session(engine) as session:
        migrate_db(session)
        seed_teams(session)
        backfill_submissions(session)
        rescore_all_submissions(session)
    yield


app = FastAPI(
    title="HPC Hackathon Leaderboard Backend",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
origins = [o.strip() for o in settings.cors_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router)
app.include_router(submissions.router)
app.include_router(leaderboard.router)
app.include_router(admin.router)
