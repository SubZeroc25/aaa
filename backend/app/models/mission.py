import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import ARRAY, JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Mission(Base):
    __tablename__ = "missions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="planning")  # planning, active, paused, completed, failed
    agent_ids: Mapped[list] = mapped_column(ARRAY(UUID(as_uuid=True)), default=list)
    config: Mapped[dict] = mapped_column(JSON, default=dict)  # checkpoints, auto_approve, etc.
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    phases: Mapped[list["MissionPhase"]] = relationship(back_populates="mission", cascade="all, delete-orphan", order_by="MissionPhase.order")


class MissionPhase(Base):
    __tablename__ = "mission_phases"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mission_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("missions.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, active, completed, failed
    order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    mission: Mapped["Mission"] = relationship(back_populates="phases")
    tasks: Mapped[list["MissionTask"]] = relationship(back_populates="phase", cascade="all, delete-orphan", order_by="MissionTask.order")


class MissionTask(Base):
    __tablename__ = "mission_tasks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phase_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("mission_phases.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, assigned, in_progress, review, completed, failed, blocked
    assigned_agent_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=True)
    dependencies: Mapped[list] = mapped_column(ARRAY(UUID(as_uuid=True)), default=list)
    order: Mapped[int] = mapped_column(Integer, default=0)
    result: Mapped[dict] = mapped_column(JSON, default=dict)  # output artifacts, content references
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    phase: Mapped["MissionPhase"] = relationship(back_populates="tasks")
