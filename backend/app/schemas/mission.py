from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class MissionTaskCreate(BaseModel):
    title: str = Field(max_length=200)
    description: str = ""
    assigned_agent_id: UUID | None = None
    dependencies: list[UUID] = Field(default_factory=list)
    order: int = 0


class MissionTaskResponse(BaseModel):
    id: UUID
    phase_id: UUID
    title: str
    description: str
    status: str
    assigned_agent_id: UUID | None
    dependencies: list[UUID]
    order: int
    result: dict
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MissionPhaseCreate(BaseModel):
    title: str = Field(max_length=200)
    description: str = ""
    order: int = 0
    tasks: list[MissionTaskCreate] = Field(default_factory=list)


class MissionPhaseResponse(BaseModel):
    id: UUID
    mission_id: UUID
    title: str
    description: str
    status: str
    order: int
    created_at: datetime
    tasks: list[MissionTaskResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class MissionCreate(BaseModel):
    title: str = Field(max_length=200)
    description: str
    agent_ids: list[UUID] = Field(default_factory=list)
    config: dict = Field(default_factory=dict)
    auto_decompose: bool = True  # let PM agent break down the mission


class MissionResponse(BaseModel):
    id: UUID
    title: str
    description: str
    status: str
    agent_ids: list[UUID]
    config: dict
    created_at: datetime
    updated_at: datetime
    phases: list[MissionPhaseResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class MissionBrief(BaseModel):
    id: UUID
    title: str
    status: str
    agent_count: int
    task_count: int
    completed_tasks: int
    created_at: datetime

    model_config = {"from_attributes": True}
