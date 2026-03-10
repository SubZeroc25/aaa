import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.agent import AgentCreate, AgentResponse, AgentStatus, AgentUpdate
from app.services.agents.agent_service import (
    create_agent,
    delete_agent,
    get_agent,
    get_all_agent_statuses,
    list_agents,
    seed_default_agents,
    update_agent,
)

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("", response_model=list[AgentResponse])
async def get_agents(db: AsyncSession = Depends(get_db)):
    return await list_agents(db)


@router.post("", response_model=AgentResponse, status_code=201)
async def create_new_agent(data: AgentCreate, db: AsyncSession = Depends(get_db)):
    return await create_agent(db, data)


@router.get("/statuses", response_model=list[AgentStatus])
async def get_statuses(db: AsyncSession = Depends(get_db)):
    return await get_all_agent_statuses(db)


@router.post("/seed", response_model=list[AgentResponse])
async def seed_agents(db: AsyncSession = Depends(get_db)):
    """Seed the default agent team."""
    agents = await seed_default_agents(db)
    if not agents:
        return await list_agents(db)
    return agents


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_single_agent(agent_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    agent = await get_agent(db, agent_id)
    if not agent:
        raise HTTPException(404, "Agent not found")
    return agent


@router.patch("/{agent_id}", response_model=AgentResponse)
async def update_existing_agent(agent_id: uuid.UUID, data: AgentUpdate, db: AsyncSession = Depends(get_db)):
    agent = await update_agent(db, agent_id, data)
    if not agent:
        raise HTTPException(404, "Agent not found")
    return agent


@router.delete("/{agent_id}", status_code=204)
async def delete_existing_agent(agent_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    if not await delete_agent(db, agent_id):
        raise HTTPException(404, "Agent not found")
