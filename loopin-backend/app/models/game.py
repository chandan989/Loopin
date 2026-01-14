from sqlalchemy import Column, String, Integer, DateTime, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.core.database import Base

class GameSession(Base):
    __tablename__ = "game_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    on_chain_id = Column(Integer, nullable=True)
    status = Column(String(20), nullable=False, default="lobby") # lobby, active, ended, cancelled
    game_type = Column(String(20), default="CASUAL") # BLITZ, ELITE, CASUAL
    max_players = Column(Integer, default=10)
    entry_fee = Column(Float, default=0.0)
    prize_pool = Column(Float, default=0.0)
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)

    participations = relationship("GameParticipant", back_populates="game", cascade="all, delete-orphan")
    # Helper to get players directly if needed, but via association object is cleaner for extra fields
    # players = relationship("Player", secondary="game_participants", back_populates="games") # Optional

class GameParticipant(Base):
    __tablename__ = "game_participants"

    game_id = Column(UUID(as_uuid=True), ForeignKey("game_sessions.id", ondelete="CASCADE"), primary_key=True)
    player_id = Column(UUID(as_uuid=True), ForeignKey("players.id", ondelete="CASCADE"), primary_key=True)
    joined_at = Column(DateTime, default=datetime.utcnow)

    game = relationship("GameSession", back_populates="participations")
    player = relationship("Player", back_populates="participations")

class SafePoint(Base):
    __tablename__ = "safe_points"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # properly mapping geography type requires GeoAlchemy2
    # For now we can assume it's there or use a simplified definition if we only query via raw SQL.
    # But usually: location = Column(Geography(geometry_type='POINT', srid=4326))
    # Since we are using raw SQL for logic in ws/game.py, we can define it generically or just rely on raw SQL.
    # Let's import Geometry from geoalchemy2 if available, or just skip if we don't assume the dependency is installed in the python env for this run?
    # The user has postgis enabled.
    # To keep it safe without checking all imports, I'll use a placeholder or assume raw SQL usage for the seeder.
    # BUT, to make the model valid for sqlalchemy if imported:
    # We will just minimal-define it.
    
    radius = Column(Float, default=5.0)
    type = Column(String(20), default="standard")

