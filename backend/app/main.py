from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import agents, costs, messages, missions, models
from app.core.database import init_db
from app.core.redis import close_redis
from app.services.models_adapters.registry import init_adapters
from app.websocket.handler import consciousness_stream_ws


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    init_adapters()
    yield
    # Shutdown
    await close_redis()


app = FastAPI(
    title="Agent Nexus",
    description="Unified multi-agent creative command center",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# REST API routes
app.include_router(agents.router, prefix="/api")
app.include_router(missions.router, prefix="/api")
app.include_router(messages.router, prefix="/api")
app.include_router(models.router, prefix="/api")
app.include_router(costs.router, prefix="/api")

# WebSocket
app.websocket("/ws/stream")(consciousness_stream_ws)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "agent-nexus"}
