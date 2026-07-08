# Deployment Checklist

Use this checklist to ensure the leaderboard is deployed securely and correctly for a live event.

> **Note on CI/CD**: The original production deployment workflow (`.github/workflows/deploy.yml`) is disabled and not part of the public artifact. Instructors should deploy using Docker Compose or their own CI/CD pipelines.

## Public Release Checklist
Before making the repository or any clones public, verify the following:
- [ ] No real `.env` file is committed.
- [ ] No real admin password is in `.env.example` or code.
- [ ] No real JWT secret is in `.env.example` or code.
- [ ] No real team tokens are in `.env.example` or code.
- [ ] No production database (`.sqlite`, `.db`) is committed.
- [ ] No raw student submissions are committed.
- [ ] No student names or emails are included in the repository.

## Before-Class Checklist
Run through these steps shortly before the event begins:
- [ ] Docker Compose builds and starts successfully (`docker compose up -d`).
- [ ] Backend health check returns a success status (`curl http://localhost:8000/api/health`).
- [ ] Frontend leaderboard loads correctly in a browser (`http://localhost:3000`).
- [ ] Admin login works using the configured `ADMIN_PASSWORD`.
- [ ] An example team token successfully authenticates via the API.
- [ ] A baseline submission is accepted and scored by the backend.
- [ ] Maximum submission limit per team is configured and enforced as expected.
