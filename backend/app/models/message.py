import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AgentMessage(Base):
    __tablename__ = "agent_messages"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mission_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("missions.id", ondelete="CASCADE"))
    from_agent_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=True)  # None = user
    to_agent_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=True)  # None = broadcast
    message_type: Mapped[str] = mapped_column(String(30), nullable=False)  # chat, handoff, consultation, review, delegation, status, error
    content: Mapped[str] = mapped_column(Text, nullable=False)
    intent: Mapped[str] = mapped_column(String(50), default="inform")  # inform, request, delegate, critique, approve, escalate
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    metadata_: Mapped[dict] = mapped_column("metadata", JSON, default=dict)  # tokens_used, blockers, artifacts
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
