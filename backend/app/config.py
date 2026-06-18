from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = "sqlite:////data/leaderboard.db"
    admin_password: str = "hpcc@school"
    admin_jwt_secret: str = "change-me-secret"
    admin_jwt_expire_minutes: int = 720
    benchmark_repo_index_path: str = "/app/ground_truth/repo_index.json"
    ground_truth_path: str = "/app/ground_truth/ground_truth.json"
    cors_origins: str = "http://localhost:3000"
    teams_seed_json: str = ""
    max_submissions_per_team: int = 10

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
