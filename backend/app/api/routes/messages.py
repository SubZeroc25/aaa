import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.message import AgentMessage
from app.schemas.message import MessageCreate, MessageResponse
from app.services.orchestration.stream import get_stream_history

router = APIRouter(prefix="/messages", tags=["messages"])


@router.get("/mission/{mission_id}", response_model=list[MessageResponse])
async def get_mission_messages(
    mission_id: uuid.UUID,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AgentMessage)
        .where(AgentMessage.mission_id == mission_id)
        .order_by(AgentMessage.created_at.desc())
        .limit(limit)
    )
    messages = list(result.scalars().all())
    messages.reverse()
    return messages


@router.get("/stream/{mission_id}")
async def get_stream(mission_id: uuid.UUID, limit: int = 100):
    """Get consciousness stream history for a mission."""
    events = await get_stream_history(str(mission_id), limit)
    return events


@router.post("", response_model=MessageResponse, status_code=201)
async def send_user_message(data: MessageCreate, db: AsyncSession = Depends(get_db)):
    """Send a user message into a mission's consciousness stream."""
    msg = AgentMessage(
        mission_id=data.mission_id,
        from_agent_id=data.from_agent_id,
        to_agent_id=data.to_agent_id,
        message_type=data.message_type,
        content=data.content,
        intent=data.intent,
        confidence=data.confidence,
        metadata_=data.metadata,
    )
    db.add(msg)
    await db.flush()
    await db.refresh(msg)
    return msg
