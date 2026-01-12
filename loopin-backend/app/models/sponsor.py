from sqlalchemy import Column, String, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from geoalchemy2 import Geography
import uuid
from app.core.database import Base

class Sponsor(Base):
    __tablename__ = "sponsors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    contact_email = Column(String(255), nullable=True)

    locations = relationship("SponsoredLocation", back_populates="sponsor")

class SponsoredLocation(Base):
    __tablename__ = "sponsored_locations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sponsor_id = Column(UUID(as_uuid=True), ForeignKey("sponsors.id"), nullable=False)
    name = Column(String(255), nullable=True)
    location = Column(Geography("POINT", srid=4326), nullable=False)
    bid_price = Column(Float, default=0.0)

    sponsor = relationship("Sponsor", back_populates="locations")
