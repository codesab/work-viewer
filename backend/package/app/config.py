
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    JIRA_SERVER: str
    JIRA_EMAIL: str
    JIRA_API_TOKEN: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"

    class Config:
        env_file = ".env"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Ensure JIRA_SERVER doesn't end with a slash
        if self.JIRA_SERVER.endswith('/'):
            self.JIRA_SERVER = self.JIRA_SERVER[:-1]

settings = Settings()
