from pydantic import model_validator
from pydantic_settings import BaseSettings
from functools import lru_cache

_GT_PATHS = {
    "private": "/app/ground_truth/ground_truth_qa_private.json",
    "public": "/app/ground_truth/ground_truth_qa_public.json",
}

_QA_PATHS = {
    "private": "/app/ground_truth/ground_truth_qa_answers_private.json",
    "public": "/app/ground_truth/ground_truth_qa_answers_public.json",
}


class Settings(BaseSettings):
    database_url: str = "sqlite:////data/leaderboard.db"
    admin_password: str = "<change-me-admin-password>"
    admin_jwt_secret: str = "<random-jwt-secret>"
    admin_jwt_expire_minutes: int = 720
    benchmark_repo_index_path: str = "/app/ground_truth/repo_index.json"
    ground_truth_path: str = ""
    ground_truth_qa_path: str = ""
    cors_origins: str = "http://localhost:3000"
    teams_seed_json: str = ""
    max_submissions_per_team: int = 10
    datasets: str = "public"
    app_env: str = "development"

    @model_validator(mode="after")
    def resolve_dataset_paths(self) -> "Settings":
        self.datasets = self.datasets.strip().lower()
        if self.datasets not in {"public", "private", "custom"}:
            raise ValueError("DATASETS must be public, private, or custom")
        if self.datasets == "custom":
            if not self.ground_truth_path or not self.ground_truth_qa_path:
                raise ValueError(
                    "custom DATASETS requires GROUND_TRUTH_PATH and GROUND_TRUTH_QA_PATH"
                )
        else:
            if not self.ground_truth_path:
                self.ground_truth_path = _GT_PATHS[self.datasets]
            if not self.ground_truth_qa_path:
                self.ground_truth_qa_path = _QA_PATHS[self.datasets]

        if self.app_env.strip().lower() == "production":
            weak_passwords = {"", "change-me-admin-password", "<change-me-admin-password>"}
            weak_jwt_secrets = {"", "change-me-long-random-secret-at-least-32-chars", "<random-jwt-secret>"}
            if self.admin_password in weak_passwords:
                raise ValueError("Set a non-placeholder ADMIN_PASSWORD for production")
            if self.admin_jwt_secret in weak_jwt_secrets or len(self.admin_jwt_secret) < 32:
                raise ValueError("Set a random ADMIN_JWT_SECRET of at least 32 characters for production")
        return self

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
