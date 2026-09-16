# HPC Summer School Mini Hackathon Leaderboard

> **Public Release Note:** This is the instructor-facing scoring, leaderboard,
> and evaluation package accompanying *An AI-Anchored Pathway into HPC Practice:
> Design and Initial Evaluation of a Three-Day Summer School in Vietnam*
> (EduHPC'26).

This repository provides a live leaderboard system, scoring backend, team-token authentication, API contract, ground-truth files, and admin tools for the HCMUT HPC Summer School mini hackathon.

**Two-Package Artifact System:**
- **Student-facing repo** (`https://github.com/hpcc-hcmut/hpc-school-mini-hackathon`): Used by students for workflow design, evidence generation, and submission generation.
- **Instructor-facing repo** (this repository): Used by instructors for scoring, leaderboard hosting, administration, and ground-truth validation.

**⚠️ IMPORTANT ⚠️**
Private questions and ground-truth materials (in `backend/ground_truth`) should **not** be shared with students during a live event.

## Instructor Documentation
Please refer to the following guides for detailed instructions on running a live event:
- [Instructor Guide](INSTRUCTOR_GUIDE.md)
- [Scoring Guide](SCORING_GUIDE.md)
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)
- [Privacy Guidelines](PRIVACY.md)
- [Public post-event survey instrument](evaluation/post_event_survey.md)

## Architecture

```
Browser → Next.js Frontend :3000 → FastAPI Backend :8000 → SQLite
Slurm Job → POST /api/submissions → Backend
```

## Quick Start

### 1. Clone and configure

```bash
git clone <repo>
cd hpc-summer-school-leaderboard

cp .env.example .env
# Edit .env — set ADMIN_PASSWORD, ADMIN_JWT_SECRET, and configure team tokens
nano .env
```

### 2. Build and run

```bash
docker compose build
docker compose up -d
```

### 3. Verify Deployment

```bash
# Check if containers are running
docker compose ps

# Check backend health
curl http://localhost:8000/api/health
```

### 4. Admin & Testing

- Open the frontend: http://localhost:3000
- Use a team token from `.env` to test one baseline submission (see [Team Submission](#team-submission-from-slurm-job)).
- Log in to the Admin dashboard to manage submissions.

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

The current final score is QA (40 points) plus rebalanced correctness (25),
evidence (15), workflow (12), and efficiency (8), followed by the implemented
runtime penalty. The backend also records the legacy 40/25/20/15 subtotal for
audit. See [SCORING_GUIDE.md](SCORING_GUIDE.md) for exact rules.

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
| `DATASETS` | `public` (safe default), `private`, or `custom` |
| `GROUND_TRUTH_PATH` | Custom legacy ground-truth path when `DATASETS=custom` |
| `GROUND_TRUTH_QA_PATH` | Custom QA ground-truth path when `DATASETS=custom` |
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
- Leaderboard polling interval: 3 seconds
- Admin JWT expires: 12 hours

No application-level 1 MB request limit is implemented in this release. Apply a
proxy/server limit if a deployment requires one.
