
import asyncio
from app.core.database import async_session_maker
from app.models.powerup import Powerup
from sqlalchemy import select

async def seed_powerups():
    async with async_session_maker() as db:
        powerups = [
            Powerup(id="shield", name="Quantum Shield", description="Invincibility for 10s", cost=5.0, type="defense"),
            Powerup(id="invisibility", name="Stealth Mode", description="Hidden from map for 15s", cost=10.0, type="stealth")
        ]
        
        for p in powerups:
            exists = await db.execute(select(Powerup).where(Powerup.id == p.id))
            if not exists.scalar_one_or_none():
                print(f"Seeding {p.name}...")
                db.add(p)
            else:
                print(f"{p.name} already exists.")
        
        await db.commit()

if __name__ == "__main__":
    asyncio.run(seed_powerups())
