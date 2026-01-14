from sqlalchemy import Column, String, Float, Text, ForeignKey, Integer, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base

class Powerup(Base):
    __tablename__ = "powerups"

    id = Column(String(50), primary_key=True) # 'shield', 'invisibility'
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    cost = Column(Float, default=0.0)
    type = Column(String(20), nullable=False) # defense, stealth

    # Relationships
    player_inventory = relationship("PlayerPowerup", back_populates="powerup_definition")

class PlayerPowerup(Base):
    __tablename__ = "player_powerups"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    player_id = Column(UUID(as_uuid=True), ForeignKey("players.id", ondelete="CASCADE"), nullable=False)
    powerup_id = Column(String(50), ForeignKey("powerups.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, default=0)
    equipped = Column(Boolean, default=False)
    
    # Relationships
    player = relationship("Player", back_populates="powerups")
    powerup_definition = relationship("Powerup", back_populates="player_inventory")
