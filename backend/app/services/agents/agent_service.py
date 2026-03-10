"""Agent lifecycle and memory management."""
import json
import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.redis import get_redis
from app.models.agent import Agent, AgentMemory
from app.schemas.agent import AgentCreate, AgentStatus, AgentUpdate
from app.services.agents.defaults import DEFAULT_AGENTS


async def create_agent(db: AsyncSession, data: AgentCreate) -> Agent:
    agent = Agent(**data.model_dump())
    db.add(agent)
    await db.flush()
    await db.refresh(agent)
    return agent


async def get_agent(db: AsyncSession, agent_id: uuid.UUID) -> Agent | None:
    return await db.get(Agent, agent_id)


async def list_agents(db: AsyncSession) -> list[Agent]:
    result = await db.execute(select(Agent).order_by(Agent.created_at))
    return list(result.scalars().all())


async def update_agent(db: AsyncSession, agent_id: uuid.UUID, data: AgentUpdate) -> Agent | None:
    agent = await db.get(Agent, agent_id)
    if not agent:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(agent, field, value)
    await db.flush()
    await db.refresh(agent)
    return agent


async def delete_agent(db: AsyncSession, agent_id: uuid.UUID) -> bool:
    agent = await db.get(Agent, agent_id)
    if not agent:
        return False
    await db.delete(agent)
    return True


async def seed_default_agents(db: AsyncSession) -> list[Agent]:
    """Create the default agent team if no agents exist."""
    result = await db.execute(select(Agent).limit(1))
    if result.scalar_one_or_none() is not None:
        return []

    agents = []
    for defn in DEFAULT_AGENTS:
        agent = Agent(**defn)
        db.add(agent)
        agents.append(agent)
    await db.flush()
    for a in agents:
        await db.refresh(a)
    return agents


# --- Agent state (Redis) ---

async def set_agent_status(agent_id: uuid.UUID, state: str, task: str | None = None, mission_id: uuid.UUID | None = None):
    r = await get_redis()
    status = {
        "state": state,
        "current_task": task,
        "mission_id": str(mission_id) if mission_id else None,
        "updated_at": datetime.utcnow().isoformat(),
    }
    await r.hset(f"agent:{agent_id}:status", mapping=status)


async def get_agent_status(agent_id: uuid.UUID) -> dict:
    r = await get_redis()
    status = await r.hgetall(f"agent:{agent_id}:status")
    return status or {"state": "idle", "current_task": None, "mission_id": None}


async def get_all_agent_statuses(db: AsyncSession) -> list[AgentStatus]:
    agents = await list_agents(db)
    statuses = []
    for agent in agents:
        raw = await get_agent_status(agent.id)
        statuses.append(AgentStatus(
            agent_id=agent.id,
            name=agent.name,
            role=agent.role,
            avatar_color=agent.avatar_color,
            state=raw.get("state", "idle"),
            current_task=raw.get("current_task"),
            mission_id=uuid.UUID(raw["mission_id"]) if raw.get("mission_id") else None,
        ))
    return statuses


# --- Agent memory ---

async def add_memory(db: AsyncSession, agent_id: uuid.UUID, memory_type: str, content: str, mission_id: uuid.UUID | None = None, metadata: dict | None = None):
    mem = AgentMemory(
        agent_id=agent_id,
        memory_type=memory_type,
        content=content,
        mission_id=mission_id,
        metadata_=metadata or {},
    )
    db.add(mem)
    await db.flush()
    return mem


async def get_memories(db: AsyncSession, agent_id: uuid.UUID, memory_type: str | None = None, mission_id: uuid.UUID | None = None, limit: int = 50) -> list[AgentMemory]:
    q = select(AgentMemory).where(AgentMemory.agent_id == agent_id)
    if memory_type:
        q = q.where(AgentMemory.memory_type == memory_type)
    if mission_id:
        q = q.where(AgentMemory.mission_id == mission_id)
    q = q.order_by(AgentMemory.created_at.desc()).limit(limit)
    result = await db.execute(q)
    return list(result.scalars().all())
