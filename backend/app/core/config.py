from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Application
    app_name: str = "Agent Nexus"
    environment: str = "development"
    debug: bool = True
    secret_key: str = "dev-secret-key-change-in-production"

    # Database
    database_url: str = "postgresql+asyncpg://nexus:nexus_secret@localhost:5432/agent_nexus"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Model API Keys
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    google_api_key: str = ""
    mistral_api_key: str = ""

    # Ollama
    ollama_base_url: str = "http://localhost:11434"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
