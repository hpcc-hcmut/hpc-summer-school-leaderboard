from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session

from .config import settings
from .db import create_db_and_tables, engine
from .seed import seed_teams
from .routers import health, submissions, leaderboard, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    with Session(engine) as session:
        seed_teams(session)
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
