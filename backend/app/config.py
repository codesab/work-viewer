
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    JIRA_SERVER: str
    JIRA_EMAIL: str
    JIRA_API_TOKEN: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"

    class Config:
        env_file = ".env"

settings = Settings()
