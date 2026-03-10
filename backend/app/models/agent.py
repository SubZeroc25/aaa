import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Agent(Base):
    __tablename__ = "agents"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False)  # architect, codewriter, creative, researcher, reviewer, projectmanager
    personality: Mapped[str] = mapped_column(Text, nullable=False)
    avatar_color: Mapped[str] = mapped_column(String(7), default="#6366f1")
    system_prompt: Mapped[str] = mapped_column(Text, nullable=False)

    # Model assignment
    model_provider: Mapped[str] = mapped_column(String(50), default="openai")  # openai, anthropic, google, mistral, ollama
    model_id: Mapped[str] = mapped_column(String(100), default="gpt-4o")
    fallback_provider: Mapped[str | None] = mapped_column(String(50), nullable=True)
    fallback_model_id: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Capabilities
    tools: Mapped[dict] = mapped_column(JSON, default=dict)
    permissions: Mapped[dict] = mapped_column(JSON, default=dict)  # api_access, code_execution, spend_credits

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    memories: Mapped[list["AgentMemory"]] = relationship(back_populates="agent", cascade="all, delete-orphan")


class AgentMemory(Base):
    __tablename__ = "agent_memories"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"))
    memory_type: Mapped[str] = mapped_column(String(20), nullable=False)  # short_term, long_term
    content: Mapped[str] = mapped_column(Text, nullable=False)
    metadata_: Mapped[dict] = mapped_column("metadata", JSON, default=dict)
    mission_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("missions.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    agent: Mapped["Agent"] = relationship(back_populates="memories")
