from fastapi import FastAPI
from app.api.v1 import games
from app.api.ws import game as ws_game
from app.core.config import settings

app = FastAPI(title="Loopin Backend", version="0.1.0")

app.include_router(games.router, prefix="/api/v1/games", tags=["games"])
app.include_router(ws_game.router, prefix="/ws", tags=["websocket"])

from app.api.v1 import ads
app.include_router(ads.router, prefix="/api/v1/ads", tags=["ads"])

from app.api.v1 import powerups
app.include_router(powerups.router, prefix="/api/v1/powerups", tags=["powerups"])

@app.get("/")
async def root():
    return {"message": "Loopin Backend Online", "docs": "/docs"}
