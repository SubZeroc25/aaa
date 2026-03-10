"""Mission lifecycle — create, decompose, execute, track."""
import json
import logging
import uuid
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.agent import Agent
from app.models.mission import Mission, MissionPhase, MissionTask
from app.schemas.message import ConsciousnessStreamEvent
from app.schemas.mission import MissionCreate
from app.services.agents.agent_service import set_agent_status
from app.services.models_adapters.registry import chat_with_fallback
from app.services.orchestration.engine import run_agent_on_task, run_review_loop
from app.services.orchestration.stream import broadcast_event

logger = logging.getLogger(__name__)


async def create_mission(db: AsyncSession, data: MissionCreate) -> Mission:
    mission = Mission(
        title=data.title,
        description=data.description,
        agent_ids=data.agent_ids,
        config=data.config,
        status="planning",
    )
    db.add(mission)
    await db.flush()
    await db.refresh(mission)
    return mission


async def get_mission(db: AsyncSession, mission_id: uuid.UUID) -> Mission | None:
    result = await db.execute(
        select(Mission)
        .where(Mission.id == mission_id)
        .options(selectinload(Mission.phases).selectinload(MissionPhase.tasks))
    )
    return result.scalar_one_or_none()


async def list_missions(db: AsyncSession) -> list[Mission]:
    result = await db.execute(
        select(Mission).order_by(Mission.created_at.desc())
    )
    return list(result.scalars().all())


async def decompose_mission(db: AsyncSession, mission: Mission) -> Mission:
    """Use the PM agent to decompose a mission into phases and tasks."""
    # Find the project manager agent
    pm = None
    for agent_id in mission.agent_ids:
        agent = await db.get(Agent, agent_id)
        if agent and agent.role == "projectmanager":
            pm = agent
            break

    if not pm:
        # Find any PM in the system
        result = await db.execute(select(Agent).where(Agent.role == "projectmanager").limit(1))
        pm = result.scalar_one_or_none()

    if not pm:
        raise ValueError("No Project Manager agent available for mission decomposition")

    await set_agent_status(pm.id, "thinking", "Decomposing mission", mission.id)
    await broadcast_event(ConsciousnessStreamEvent(
        event_type="status_change",
        agent_id=pm.id,
        agent_name=pm.name,
        agent_color=pm.avatar_color,
        mission_id=mission.id,
        content=f"{pm.name} is planning the mission: {mission.title}",
        timestamp=datetime.now(timezone.utc),
    ))

    # Get available agents info
    agents_info = []
    for aid in mission.agent_ids:
        a = await db.get(Agent, aid)
        if a:
            agents_info.append(f"- {a.name} (role: {a.role})")

    messages = [{
        "role": "user",
        "content": (
            f"Grand Mission: {mission.title}\n\n"
            f"Description: {mission.description}\n\n"
            f"Available team members:\n{chr(10).join(agents_info)}\n\n"
            "Decompose this mission into phases and tasks. "
            "Respond ONLY with valid JSON in this exact format:\n"
            '{"phases": [{"title": "Phase Name", "description": "...", "tasks": ['
            '{"title": "Task Name", "description": "...", "assigned_role": "role_name"}]}]}'
        ),
    }]

    response = await chat_with_fallback(
        primary_provider=pm.model_provider,
        primary_model=pm.model_id,
        fallback_provider=pm.fallback_provider,
        fallback_model=pm.fallback_model_id,
        messages=messages,
        system_prompt=pm.system_prompt,
    )

    # Parse the plan
    try:
        # Extract JSON from response (handle markdown code blocks)
        content = response.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]
        plan = json.loads(content.strip())
    except (json.JSONDecodeError, IndexError):
        logger.error(f"PM agent returned invalid JSON: {response.content[:500]}")
        # Create a simple default plan
        plan = {"phases": [{"title": "Execution", "description": mission.description, "tasks": [
            {"title": mission.title, "description": mission.description, "assigned_role": "codewriter"}
        ]}]}

    # Build role -> agent mapping
    role_map: dict[str, Agent] = {}
    for aid in mission.agent_ids:
        a = await db.get(Agent, aid)
        if a:
            role_map[a.role] = a

    # Create phases and tasks in DB
    for phase_idx, phase_data in enumerate(plan.get("phases", [])):
        phase = MissionPhase(
            mission_id=mission.id,
            title=phase_data["title"],
            description=phase_data.get("description", ""),
            order=phase_idx,
        )
        db.add(phase)
        await db.flush()
        await db.refresh(phase)

        for task_idx, task_data in enumerate(phase_data.get("tasks", [])):
            assigned_role = task_data.get("assigned_role", "")
            assigned_agent = role_map.get(assigned_role)
            task = MissionTask(
                phase_id=phase.id,
                title=task_data["title"],
                description=task_data.get("description", ""),
                assigned_agent_id=assigned_agent.id if assigned_agent else None,
                order=task_idx,
            )
            db.add(task)

    mission.status = "active"
    await db.flush()

    await set_agent_status(pm.id, "idle")
    await broadcast_event(ConsciousnessStreamEvent(
        event_type="task_update",
        agent_id=pm.id,
        agent_name=pm.name,
        agent_color=pm.avatar_color,
        mission_id=mission.id,
        content=f"Mission plan created with {len(plan.get('phases', []))} phases",
        timestamp=datetime.now(timezone.utc),
    ))

    # Reload with phases
    return await get_mission(db, mission.id)


async def execute_next_task(db: AsyncSession, mission_id: uuid.UUID) -> dict | None:
    """Find and execute the next available task in the mission."""
    mission = await get_mission(db, mission_id)
    if not mission or mission.status != "active":
        return None

    # Find next pending task with no unmet dependencies
    for phase in mission.phases:
        if phase.status == "completed":
            continue
        if phase.status == "pending":
            phase.status = "active"

        for task in phase.tasks:
            if task.status != "pending":
                continue

            # Check dependencies
            if task.dependencies:
                deps_met = True
                for dep_id in task.dependencies:
                    for p in mission.phases:
                        for t in p.tasks:
                            if t.id == dep_id and t.status != "completed":
                                deps_met = False
                if not deps_met:
                    continue

            if not task.assigned_agent_id:
                continue

            agent = await db.get(Agent, task.assigned_agent_id)
            if not agent:
                continue

            # Execute the task
            task.status = "in_progress"
            await db.flush()

            result = await run_agent_on_task(db, agent, task, mission_id)

            task.status = "completed"
            task.result = {"output": result[:5000]}  # Truncate for storage
            await db.flush()

            # Check if phase is complete
            all_done = all(t.status == "completed" for t in phase.tasks)
            if all_done:
                phase.status = "completed"

            # Check if mission is complete
            mission_obj = await get_mission(db, mission_id)
            if mission_obj and all(p.status == "completed" for p in mission_obj.phases):
                mission_obj.status = "completed"

            await db.flush()
            return {"task_id": str(task.id), "agent": agent.name, "result": result}

    return None


async def get_mission_progress(db: AsyncSession, mission_id: uuid.UUID) -> dict:
    """Get mission progress statistics."""
    mission = await get_mission(db, mission_id)
    if not mission:
        return {}

    total_tasks = 0
    completed_tasks = 0
    in_progress_tasks = 0
    blocked_tasks = 0

    for phase in mission.phases:
        for task in phase.tasks:
            total_tasks += 1
            if task.status == "completed":
                completed_tasks += 1
            elif task.status in ("in_progress", "assigned"):
                in_progress_tasks += 1
            elif task.status == "blocked":
                blocked_tasks += 1

    return {
        "mission_id": str(mission_id),
        "status": mission.status,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "in_progress_tasks": in_progress_tasks,
        "blocked_tasks": blocked_tasks,
        "progress_pct": round(completed_tasks / total_tasks * 100, 1) if total_tasks > 0 else 0,
        "phases": [
            {
                "id": str(p.id),
                "title": p.title,
                "status": p.status,
                "task_count": len(p.tasks),
                "completed": sum(1 for t in p.tasks if t.status == "completed"),
            }
            for p in mission.phases
        ],
    }
