from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.models.sponsor import SponsoredLocation, Sponsor
from app.schemas.sponsor import SponsoredLocationResponse, SponsoredLocationCreate

router = APIRouter()

@router.post("/locations", response_model=SponsoredLocationResponse, status_code=201)
async def create_sponsored_location(location: SponsoredLocationCreate, db: AsyncSession = Depends(get_db)):
    """
    Create a new sponsored location. 
    In a real app, 'sponsor_name' would resolve to an existing Sponsor or create one.
    """
    # 1. Find or create sponsor
    result = await db.execute(select(Sponsor).where(Sponsor.name == location.sponsor_name))
    sponsor = result.scalar_one_or_none()
    
    if not sponsor:
        sponsor = Sponsor(name=location.sponsor_name)
        db.add(sponsor)
        await db.flush() # Flush to get sponsor ID

    # 2. Create Location
    # Note: geoalchemy2 requires WKT or straight construction for geometry. 
    # For simplicitly here we are assuming raw lat/lng are stored or handled later.
    # In a real PostGIS setup with GeoAlchemy2:
    # point = f"POINT({location.lng} {location.lat})"
    
    # Placeholder for geometry creation (requires DB with PostGIS which is currently down)
    # We will just instantiate the object. 
    
    new_location = SponsoredLocation(
        sponsor_id=sponsor.id,
        name=location.name or f"{sponsor.name} Location",
        bid_price=location.bid_price,
        # location=point # Commented out until DB is up to avoid runtime errors in testing if we mock
        location=f"POINT({location.lng} {location.lat})" 
    )
    
    db.add(new_location)
    try:
        await db.commit()
        await db.refresh(new_location)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    return new_location

@router.get("/locations", response_model=List[SponsoredLocationResponse])
async def get_sponsored_locations(db: AsyncSession = Depends(get_db)):
    """
    Fetch all active sponsored locations for the AI Manager.
    """
    result = await db.execute(select(SponsoredLocation))
    locations = result.scalars().all()
    return locations
