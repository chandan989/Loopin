from sqlalchemy import Column, String, Float, ForeignKey, Integer, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base

class Powerup(Base):
    __tablename__ = "powerups"

    id = Column(String(50), primary_key=True) # e.g. 'shield', 'ghost'
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    cost = Column(Float, default=0.0)
    type = Column(String(20), nullable=False) # defense, offense, stealth, bonus

class PlayerPowerup(Base):
    __tablename__ = "player_powerups"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    player_id = Column(UUID(as_uuid=True), ForeignKey("players.id", ondelete="CASCADE"), nullable=False)
    powerup_id = Column(String(50), ForeignKey("powerups.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, default=0)
    equipped = Column(Boolean, default=False)

    player = relationship("Player", back_populates="powerups")
    powerup = relationship("Powerup")
