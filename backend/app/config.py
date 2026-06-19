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
    admin_password: str = "hpcc@school"
    admin_jwt_secret: str = "change-me-secret"
    admin_jwt_expire_minutes: int = 720
    benchmark_repo_index_path: str = "/app/ground_truth/repo_index.json"
    ground_truth_path: str = ""
    ground_truth_qa_path: str = ""
    cors_origins: str = "http://localhost:3000"
    teams_seed_json: str = ""
    max_submissions_per_team: int = 10
    datasets: str = "public"

    @model_validator(mode="after")
    def resolve_dataset_paths(self) -> "Settings":
        if not self.ground_truth_path:
            self.ground_truth_path = _GT_PATHS.get(self.datasets, _GT_PATHS["public"])
        if not self.ground_truth_qa_path:
            self.ground_truth_qa_path = _QA_PATHS.get(self.datasets, _QA_PATHS["public"])
        return self

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
