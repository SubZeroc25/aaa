import asyncio
import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session, get_db
from app.schemas.mission import MissionBrief, MissionCreate, MissionResponse
from app.services.missions.mission_service import (
    create_mission,
    decompose_mission,
    execute_next_task,
    get_mission,
    get_mission_progress,
    list_missions,
)

router = APIRouter(prefix="/missions", tags=["missions"])


@router.get("", response_model=list[MissionBrief])
async def get_missions(db: AsyncSession = Depends(get_db)):
    missions = await list_missions(db)
    briefs = []
    for m in missions:
        progress = await get_mission_progress(db, m.id)
        briefs.append(MissionBrief(
            id=m.id,
            title=m.title,
            status=m.status,
            agent_count=len(m.agent_ids),
            task_count=progress.get("total_tasks", 0),
            completed_tasks=progress.get("completed_tasks", 0),
            created_at=m.created_at,
        ))
    return briefs


@router.post("", response_model=MissionResponse, status_code=201)
async def create_new_mission(
    data: MissionCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    mission = await create_mission(db, data)

    if data.auto_decompose:
        # Decompose in the same request so the user sees the plan
        mission = await decompose_mission(db, mission)

    return mission


@router.get("/{mission_id}", response_model=MissionResponse)
async def get_single_mission(mission_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    mission = await get_mission(db, mission_id)
    if not mission:
        raise HTTPException(404, "Mission not found")
    return mission


@router.get("/{mission_id}/progress")
async def get_progress(mission_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    progress = await get_mission_progress(db, mission_id)
    if not progress:
        raise HTTPException(404, "Mission not found")
    return progress


@router.post("/{mission_id}/execute-next")
async def execute_next(mission_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Execute the next available task in the mission."""
    result = await execute_next_task(db, mission_id)
    if result is None:
        return {"status": "no_tasks_available", "message": "No pending tasks or mission not active"}
    return result


@router.post("/{mission_id}/run")
async def run_mission(mission_id: uuid.UUID, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    """Run all pending tasks in the mission sequentially in the background."""
    mission = await get_mission(db, mission_id)
    if not mission:
        raise HTTPException(404, "Mission not found")
    if mission.status != "active":
        raise HTTPException(400, f"Mission is {mission.status}, must be active")

    async def _run_all():
        async with async_session() as session:
            while True:
                result = await execute_next_task(session, mission_id)
                if result is None:
                    break
                await session.commit()

    background_tasks.add_task(_run_all)
    return {"status": "started", "message": "Mission execution started in background"}


@router.post("/{mission_id}/pause")
async def pause_mission(mission_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    mission = await get_mission(db, mission_id)
    if not mission:
        raise HTTPException(404, "Mission not found")
    mission.status = "paused"
    await db.flush()
    return {"status": "paused"}


@router.post("/{mission_id}/resume")
async def resume_mission(mission_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    mission = await get_mission(db, mission_id)
    if not mission:
        raise HTTPException(404, "Mission not found")
    mission.status = "active"
    await db.flush()
    return {"status": "active"}
