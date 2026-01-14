from sqlalchemy import Column, String, ForeignKey, Float, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from geoalchemy2 import Geography
import uuid
from datetime import datetime
from app.core.database import Base

class Player(Base):
    __tablename__ = "players"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    wallet_address = Column(String(100), nullable=False, unique=True, index=True)
    username = Column(String(50), unique=True, nullable=True)
    avatar_seed = Column(String(100), nullable=True)
    level = Column(Integer, default=1)
    joined_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    stats = relationship("PlayerStats", uselist=False, back_populates="player", cascade="all, delete-orphan")
    game_history = relationship("PlayerGameHistory", back_populates="player", cascade="all, delete-orphan")
    powerups = relationship("PlayerPowerup", back_populates="player", cascade="all, delete-orphan")
    participations = relationship("GameParticipant", back_populates="player", cascade="all, delete-orphan")
    
    trails = relationship("PlayerTrail", back_populates="player", cascade="all, delete-orphan")
    territories = relationship("PlayerTerritory", back_populates="player", cascade="all, delete-orphan")

class PlayerStats(Base):
    __tablename__ = "player_stats"
    
    player_id = Column(UUID(as_uuid=True), ForeignKey("players.id", ondelete="CASCADE"), primary_key=True)
    total_area = Column(Float, default=0.0)
    games_played = Column(Integer, default=0)
    games_won = Column(Integer, default=0)
    total_earnings = Column(Float, default=0.0)
    longest_trail = Column(Float, default=0.0)
    biggest_loop = Column(Float, default=0.0)
    current_streak = Column(Integer, default=0)
    last_daily_reward_claimed_at = Column(DateTime, nullable=True)

    player = relationship("Player", back_populates="stats")

class PlayerGameHistory(Base):
    __tablename__ = "player_game_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    player_id = Column(UUID(as_uuid=True), ForeignKey("players.id", ondelete="CASCADE"), nullable=False)
    game_id = Column(UUID(as_uuid=True), ForeignKey("game_sessions.id", ondelete="SET NULL"), nullable=True)
    rank = Column(Integer, nullable=True)
    area_captured = Column(Float, nullable=True)
    prize_won = Column(Float, nullable=True)
    played_at = Column(DateTime, default=datetime.utcnow)

    player = relationship("Player", back_populates="game_history")
    game = relationship("GameSession")

class PlayerTrail(Base):
    __tablename__ = "player_trails"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    player_id = Column(UUID(as_uuid=True), ForeignKey("players.id", ondelete="CASCADE"), nullable=False)
    trail = Column(Geography("LINESTRING", srid=4326), nullable=False)

    player = relationship("Player", back_populates="trails")

class PlayerTerritory(Base):
    __tablename__ = "player_territories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    player_id = Column(UUID(as_uuid=True), ForeignKey("players.id", ondelete="CASCADE"), nullable=False)
    territory = Column(Geography("POLYGON", srid=4326), nullable=False)
    area_sqm = Column(Float, nullable=False)

    player = relationship("Player", back_populates="territories")
