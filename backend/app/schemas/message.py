from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class MessageCreate(BaseModel):
    mission_id: UUID
    from_agent_id: UUID | None = None
    to_agent_id: UUID | None = None  # None = broadcast
    message_type: str = "chat"
    content: str
    intent: str = "inform"
    confidence: float | None = None
    metadata: dict = Field(default_factory=dict)


class MessageResponse(BaseModel):
    id: UUID
    mission_id: UUID
    from_agent_id: UUID | None
    to_agent_id: UUID | None
    message_type: str
    content: str
    intent: str
    confidence: float | None
    metadata: dict = Field(default_factory=dict, alias="metadata_")
    created_at: datetime

    model_config = {"from_attributes": True, "populate_by_name": True}


class ConsciousnessStreamEvent(BaseModel):
    """Real-time event on the shared consciousness stream."""
    event_type: str  # message, status_change, task_update, thought
    agent_id: UUID | None = None
    agent_name: str | None = None
    agent_color: str | None = None
    mission_id: UUID
    content: str
    metadata: dict = Field(default_factory=dict)
    timestamp: datetime
