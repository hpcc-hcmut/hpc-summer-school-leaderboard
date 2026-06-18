# HPC Summer School Mini Hackathon Leaderboard

A live leaderboard system for the HCMUT HPC Summer School mini hackathon.

## Architecture

```
Browser → Next.js Frontend :3000 → FastAPI Backend :8000 → SQLite
Slurm Job → POST /api/submissions → Backend
```

## Quick Start

### 1. Clone and configure

```bash
git clone <repo>
cd hpc-hackathon-leaderboard

cp .env.example .env
# Edit .env — set ADMIN_PASSWORD and ADMIN_JWT_SECRET
nano .env
```

### 2. Build and run

```bash
docker compose build
docker compose up -d
```

### 3. Verify

```bash
docker compose ps
curl http://localhost:8000/api/health
```

Open the leaderboard: http://localhost:3000

---

## Team Submission (from Slurm job)

```bash
curl -X POST "http://<leaderboard-host>:8000/api/submissions" \
  -H "Content-Type: application/json" \
  -H "X-Team-ID: $TEAM_ID" \
  -H "X-Team-Token: $TEAM_TOKEN" \
  --data-binary @submission.json
```

**Response:**
```json
{
  "submission_id": 42,
  "valid": true,
  "score": 82.4,
  "rank": 3,
  "breakdown": { "correctness": 34.0, "evidence": 21.0, "workflow": 15.0, "efficiency": 12.4 },
  "messages": ["Correct main entrypoint (+5)", "Correct framework (+5)", "..."]
}
```

---

## Scoring Rubric

| Category | Max Points |
|---|---|
| Correctness of analysis | 40 |
| Evidence grounding | 25 |
| Agentic workflow design | 20 |
| HPC/resource efficiency | 15 |
| **Total** | **100** |

---

## Admin Workflow

1. Open http://localhost:3000
2. Click **Admin** in the top-right
3. Enter the `ADMIN_PASSWORD` from your `.env`
4. View all submissions, filter by team, soft-delete bad/test runs
5. Deleted runs are hidden from the public leaderboard but can be restored

---

## API Reference

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | — | Health check |
| POST | `/api/submissions` | X-Team-ID + X-Team-Token | Submit run result |
| GET | `/api/leaderboard` | — | Public leaderboard |
| GET | `/api/runs/{id}` | — | Run detail |
| POST | `/api/admin/login` | — | Admin login |
| GET | `/api/admin/runs` | Bearer JWT | List all runs |
| DELETE | `/api/admin/runs/{id}` | Bearer JWT | Soft-delete run |
| POST | `/api/admin/runs/{id}/restore` | Bearer JWT | Restore run |

---

## Environment Variables

| Variable | Description |
|---|---|
| `ADMIN_PASSWORD` | Admin dashboard password |
| `ADMIN_JWT_SECRET` | Secret for signing admin JWTs (min 32 chars) |
| `TEAMS_SEED_JSON` | JSON array of `{team_id, team_name, token}` |
| `DATABASE_URL` | SQLite path (default: `sqlite:////data/leaderboard.db`) |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `BACKEND_INTERNAL_URL` | Internal URL for frontend→backend calls |

---

## Docker

```bash
# Build only
docker compose build

# Start
docker compose up -d

# Logs
docker compose logs -f

# Stop
docker compose down

# Stop and remove data volume (CAUTION: deletes all submissions)
docker compose down -v
```

The SQLite database is persisted in a Docker named volume (`leaderboard_data`) and survives container restarts.

---

## Limits

- Max 10 submissions per team (HTTP 429 if exceeded)
- Max submission size: 1 MB
- Leaderboard polling interval: 3 seconds
- Admin JWT expires: 12 hours
