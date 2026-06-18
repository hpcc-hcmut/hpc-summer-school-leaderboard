import json
from datetime import datetime, timezone
from sqlmodel import Session, select
from .models import Team
from .auth import hash_token
from .config import settings


def seed_teams(session: Session) -> None:
    """Seed teams from TEAMS_SEED_JSON environment variable."""
    raw = settings.teams_seed_json.strip()
    if not raw:
        return

    try:
        teams_data = json.loads(raw)
    except json.JSONDecodeError:
        print("[seed] Invalid TEAMS_SEED_JSON — skipping seed")
        return

    now = datetime.now(timezone.utc).isoformat()
    for t in teams_data:
        team_id = t.get("team_id", "").strip()
        team_name = t.get("team_name", team_id)
        token = t.get("token", "").strip()

        if not team_id or not token:
            continue

        existing = session.exec(select(Team).where(Team.team_id == team_id)).first()
        if existing:
            continue

        team = Team(
            team_id=team_id,
            team_name=team_name,
            token_hash=hash_token(token),
            created_at=now,
        )
        session.add(team)

    session.commit()
    print("[seed] Teams seeded successfully")
