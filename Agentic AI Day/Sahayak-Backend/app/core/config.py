from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # db_user: str
    # db_password: str
    # db_host: str
    # db_port: int
    # db_name: str

    # gemini_api_key: str
    # app_name: str = "SAHAYAK"
    
    env: str = "development"
    log_level: str = "debug"

    # google_genai_use_vertexai: bool
    # google_cloud_project: str
    # google_cloud_location: str
    # google_cloud_staging_bucket: bool

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
