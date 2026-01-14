import asyncio
import os
import sys

# Add parent directory to path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import delete
from app.core.database import AsyncSessionLocal
from app.models.game import SafePoint # We need to create this model first!
# Actually, I should probably check if I can generic raw sql it if models aren't updated yet.
# But for correctness I should update models.
# Let's write raw SQL for the seed script to avoid dependency on model updates immediately.
from sqlalchemy import text

async def seed_safe_points():
    async with AsyncSessionLocal() as db:
        print("Seeding Safe Points...")
        
        # Clear existing
        await db.execute(text("DELETE FROM safe_points"))
        
        # Bangalore Area roughly
        points = [
            (12.9716, 77.5946), # Base
            (12.9720, 77.5950), # North East
            (12.9710, 77.5940), # South West
            (12.9730, 77.5960), # Farther out
            (12.9700, 77.5930), # Farther out
        ]
        
        for lat, lng in points:
            await db.execute(text(f"""
                INSERT INTO safe_points (location, radius, type)
                VALUES (ST_SetSRID(ST_MakePoint({lng}, {lat}), 4326), 10.0, 'standard')
            """))
            
        await db.commit()
        print(f"Seeded {len(points)} safe points.")

if __name__ == "__main__":
    asyncio.run(seed_safe_points())
