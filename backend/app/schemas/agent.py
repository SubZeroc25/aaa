from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class AgentCreate(BaseModel):
    name: str = Field(max_length=100)
    role: str = Field(max_length=50)
    personality: str
    avatar_color: str = "#6366f1"
    system_prompt: str
    model_provider: str = "openai"
    model_id: str = "gpt-4o"
    fallback_provider: str | None = None
    fallback_model_id: str | None = None
    tools: dict = Field(default_factory=dict)
    permissions: dict = Field(default_factory=dict)


class AgentUpdate(BaseModel):
    name: str | None = None
    personality: str | None = None
    avatar_color: str | None = None
    system_prompt: str | None = None
    model_provider: str | None = None
    model_id: str | None = None
    fallback_provider: str | None = None
    fallback_model_id: str | None = None
    tools: dict | None = None
    permissions: dict | None = None


class AgentResponse(BaseModel):
    id: UUID
    name: str
    role: str
    personality: str
    avatar_color: str
    system_prompt: str
    model_provider: str
    model_id: str
    fallback_provider: str | None
    fallback_model_id: str | None
    tools: dict
    permissions: dict
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AgentStatus(BaseModel):
    agent_id: UUID
    name: str
    role: str
    avatar_color: str
    state: str = "idle"  # idle, thinking, writing, reviewing, blocked
    current_task: str | None = None
    mission_id: UUID | None = None
