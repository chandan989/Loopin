from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # Supabase / Auth
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_JWT_SECRET: Optional[str] = None

    # Stacks / Blockchain
    STACKS_NETWORK: str = "testnet"
    STACKS_RPC_URL: str = "https://api.testnet.hiro.so"
    CONTRACT_ADDRESS: Optional[str] = None
    CONTRACT_NAME: str = "loopin-game-v1"

    # Web3 Service
    WEB3_MANAGER_URL: str = "http://localhost:3001/api/web3"
    WEB3_MANAGER_API_KEY: Optional[str] = None

    # Game Config
    TERRITORY_MIN_AREA_SQM: float = 100.0
    COLLISION_TOLERANCE_METERS: float = 5.0

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
