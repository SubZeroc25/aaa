import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.cost import CostRecord

router = APIRouter(prefix="/costs", tags=["costs"])


@router.get("/mission/{mission_id}")
async def get_mission_costs(mission_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Get cost breakdown for a mission."""
    # Total cost
    total_q = await db.execute(
        select(func.sum(CostRecord.cost_usd), func.sum(CostRecord.total_tokens))
        .where(CostRecord.mission_id == mission_id)
    )
    total_row = total_q.one()
    total_cost = total_row[0] or 0.0
    total_tokens = total_row[1] or 0

    # Per-agent breakdown
    agent_q = await db.execute(
        select(
            CostRecord.agent_id,
            CostRecord.model_provider,
            CostRecord.model_id,
            func.sum(CostRecord.cost_usd).label("cost"),
            func.sum(CostRecord.total_tokens).label("tokens"),
            func.count().label("requests"),
        )
        .where(CostRecord.mission_id == mission_id)
        .group_by(CostRecord.agent_id, CostRecord.model_provider, CostRecord.model_id)
    )

    by_agent = [
        {
            "agent_id": str(row.agent_id),
            "model_provider": row.model_provider,
            "model_id": row.model_id,
            "cost_usd": round(row.cost, 6),
            "total_tokens": row.tokens,
            "requests": row.requests,
        }
        for row in agent_q.all()
    ]

    return {
        "mission_id": str(mission_id),
        "total_cost_usd": round(total_cost, 6),
        "total_tokens": total_tokens,
        "by_agent": by_agent,
    }


@router.get("/summary")
async def get_cost_summary(db: AsyncSession = Depends(get_db)):
    """Get overall cost summary across all missions."""
    result = await db.execute(
        select(
            CostRecord.model_provider,
            func.sum(CostRecord.cost_usd).label("cost"),
            func.sum(CostRecord.total_tokens).label("tokens"),
            func.count().label("requests"),
        )
        .group_by(CostRecord.model_provider)
    )

    by_provider = [
        {
            "provider": row.model_provider,
            "cost_usd": round(row.cost, 6),
            "total_tokens": row.tokens,
            "requests": row.requests,
        }
        for row in result.all()
    ]

    total_cost = sum(p["cost_usd"] for p in by_provider)
    total_tokens = sum(p["total_tokens"] for p in by_provider)

    return {
        "total_cost_usd": round(total_cost, 6),
        "total_tokens": total_tokens,
        "by_provider": by_provider,
    }
