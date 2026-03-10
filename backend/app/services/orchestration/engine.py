"""Agent orchestration engine — state machine with event-driven collaboration."""
import json
import logging
import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.agent import Agent
from app.models.cost import CostRecord
from app.models.message import AgentMessage
from app.models.mission import MissionTask
from app.schemas.message import ConsciousnessStreamEvent
from app.services.agents.agent_service import add_memory, get_memories, set_agent_status
from app.services.models_adapters.registry import chat_with_fallback
from app.services.orchestration.stream import broadcast_event

logger = logging.getLogger(__name__)


async def run_agent_on_task(
    db: AsyncSession,
    agent: Agent,
    task: MissionTask,
    mission_id: uuid.UUID,
    context_messages: list[dict] | None = None,
) -> str:
    """Execute a single agent on a task, managing state transitions."""
    # Set agent to thinking
    await set_agent_status(agent.id, "thinking", task.title, mission_id)
    await broadcast_event(ConsciousnessStreamEvent(
        event_type="status_change",
        agent_id=agent.id,
        agent_name=agent.name,
        agent_color=agent.avatar_color,
        mission_id=mission_id,
        content=f"{agent.name} is analyzing task: {task.title}",
        timestamp=datetime.now(timezone.utc),
    ))

    # Build message history
    memories = await get_memories(db, agent.id, mission_id=mission_id, limit=20)
    memory_context = "\n".join(f"[Memory] {m.content}" for m in reversed(memories))

    messages = []
    if memory_context:
        messages.append({"role": "user", "content": f"Relevant context from your memory:\n{memory_context}"})
        messages.append({"role": "assistant", "content": "Understood, I have this context available."})
    if context_messages:
        messages.extend(context_messages)
    messages.append({
        "role": "user",
        "content": f"Task: {task.title}\n\nDescription: {task.description}\n\nPlease complete this task thoroughly.",
    })

    # Transition to writing
    await set_agent_status(agent.id, "writing", task.title, mission_id)

    # Call the model
    response = await chat_with_fallback(
        primary_provider=agent.model_provider,
        primary_model=agent.model_id,
        fallback_provider=agent.fallback_provider,
        fallback_model=agent.fallback_model_id,
        messages=messages,
        system_prompt=agent.system_prompt,
    )

    # Record cost
    cost = CostRecord(
        mission_id=mission_id,
        agent_id=agent.id,
        model_provider=response.provider,
        model_id=response.model_id,
        prompt_tokens=response.prompt_tokens,
        completion_tokens=response.completion_tokens,
        total_tokens=response.total_tokens,
        cost_usd=_estimate_cost(response.provider, response.model_id, response.prompt_tokens, response.completion_tokens),
    )
    db.add(cost)

    # Save message to DB
    msg = AgentMessage(
        mission_id=mission_id,
        from_agent_id=agent.id,
        message_type="task_output",
        content=response.content,
        intent="inform",
        confidence=0.85,
        metadata_={"tokens": response.total_tokens, "task_id": str(task.id)},
    )
    db.add(msg)

    # Store in agent memory
    await add_memory(
        db, agent.id, "short_term",
        f"Completed task '{task.title}': {response.content[:500]}",
        mission_id=mission_id,
    )

    # Broadcast to consciousness stream
    await broadcast_event(ConsciousnessStreamEvent(
        event_type="message",
        agent_id=agent.id,
        agent_name=agent.name,
        agent_color=agent.avatar_color,
        mission_id=mission_id,
        content=response.content,
        metadata={"task_id": str(task.id), "tokens": response.total_tokens},
        timestamp=datetime.now(timezone.utc),
    ))

    # Set agent back to idle
    await set_agent_status(agent.id, "idle")
    await db.flush()

    return response.content


async def run_consultation(
    db: AsyncSession,
    requesting_agent: Agent,
    consulted_agent: Agent,
    question: str,
    mission_id: uuid.UUID,
) -> str:
    """One agent consults another for expertise without task transfer."""
    await set_agent_status(consulted_agent.id, "thinking", f"Consulted by {requesting_agent.name}", mission_id)

    await broadcast_event(ConsciousnessStreamEvent(
        event_type="message",
        agent_id=requesting_agent.id,
        agent_name=requesting_agent.name,
        agent_color=requesting_agent.avatar_color,
        mission_id=mission_id,
        content=f"@{consulted_agent.name} {question}",
        metadata={"type": "consultation"},
        timestamp=datetime.now(timezone.utc),
    ))

    messages = [{"role": "user", "content": f"{requesting_agent.name} ({requesting_agent.role}) asks:\n{question}"}]

    response = await chat_with_fallback(
        primary_provider=consulted_agent.model_provider,
        primary_model=consulted_agent.model_id,
        fallback_provider=consulted_agent.fallback_provider,
        fallback_model=consulted_agent.fallback_model_id,
        messages=messages,
        system_prompt=consulted_agent.system_prompt,
    )

    # Record the exchange
    db.add(AgentMessage(
        mission_id=mission_id,
        from_agent_id=consulted_agent.id,
        to_agent_id=requesting_agent.id,
        message_type="consultation",
        content=response.content,
        intent="inform",
    ))

    cost = CostRecord(
        mission_id=mission_id,
        agent_id=consulted_agent.id,
        model_provider=response.provider,
        model_id=response.model_id,
        prompt_tokens=response.prompt_tokens,
        completion_tokens=response.completion_tokens,
        total_tokens=response.total_tokens,
        cost_usd=_estimate_cost(response.provider, response.model_id, response.prompt_tokens, response.completion_tokens),
    )
    db.add(cost)

    await set_agent_status(consulted_agent.id, "idle")
    await broadcast_event(ConsciousnessStreamEvent(
        event_type="message",
        agent_id=consulted_agent.id,
        agent_name=consulted_agent.name,
        agent_color=consulted_agent.avatar_color,
        mission_id=mission_id,
        content=response.content,
        metadata={"type": "consultation_response"},
        timestamp=datetime.now(timezone.utc),
    ))

    await db.flush()
    return response.content


async def run_review_loop(
    db: AsyncSession,
    creator_agent: Agent,
    reviewer_agent: Agent,
    content: str,
    task: MissionTask,
    mission_id: uuid.UUID,
    max_iterations: int = 3,
) -> str:
    """Reviewer critiques, creator revises, until approval or max iterations."""
    current_content = content

    for iteration in range(max_iterations):
        # Review phase
        await set_agent_status(reviewer_agent.id, "reviewing", task.title, mission_id)
        review_messages = [
            {"role": "user", "content": (
                f"Review the following output for task '{task.title}':\n\n{current_content}\n\n"
                "Respond with APPROVED if it meets quality standards, or provide specific revision requests."
            )}
        ]

        review_response = await chat_with_fallback(
            primary_provider=reviewer_agent.model_provider,
            primary_model=reviewer_agent.model_id,
            fallback_provider=reviewer_agent.fallback_provider,
            fallback_model=reviewer_agent.fallback_model_id,
            messages=review_messages,
            system_prompt=reviewer_agent.system_prompt,
        )

        db.add(AgentMessage(
            mission_id=mission_id,
            from_agent_id=reviewer_agent.id,
            to_agent_id=creator_agent.id,
            message_type="review",
            content=review_response.content,
            intent="critique",
        ))

        await broadcast_event(ConsciousnessStreamEvent(
            event_type="message",
            agent_id=reviewer_agent.id,
            agent_name=reviewer_agent.name,
            agent_color=reviewer_agent.avatar_color,
            mission_id=mission_id,
            content=f"Review (iteration {iteration + 1}): {review_response.content[:300]}",
            timestamp=datetime.now(timezone.utc),
        ))

        if "APPROVED" in review_response.content.upper():
            await set_agent_status(reviewer_agent.id, "idle")
            break

        # Revision phase
        await set_agent_status(creator_agent.id, "writing", f"Revising: {task.title}", mission_id)
        revision_messages = [
            {"role": "user", "content": f"Your previous output:\n{current_content}"},
            {"role": "user", "content": f"Reviewer feedback:\n{review_response.content}\n\nPlease revise."},
        ]

        revision_response = await chat_with_fallback(
            primary_provider=creator_agent.model_provider,
            primary_model=creator_agent.model_id,
            fallback_provider=creator_agent.fallback_provider,
            fallback_model=creator_agent.fallback_model_id,
            messages=revision_messages,
            system_prompt=creator_agent.system_prompt,
        )

        current_content = revision_response.content
        await set_agent_status(creator_agent.id, "idle")
        await set_agent_status(reviewer_agent.id, "idle")

    await db.flush()
    return current_content


def _estimate_cost(provider: str, model_id: str, prompt_tokens: int, completion_tokens: int) -> float:
    """Rough cost estimation per provider/model. Rates in USD per 1M tokens."""
    rates = {
        ("openai", "gpt-4o"): (2.50, 10.00),
        ("openai", "gpt-4o-mini"): (0.15, 0.60),
        ("anthropic", "claude-sonnet-4-6"): (3.00, 15.00),
        ("anthropic", "claude-haiku-4-5-20251001"): (0.80, 4.00),
        ("google", "gemini-2.0-flash"): (0.075, 0.30),
        ("mistral", "mistral-large-latest"): (2.00, 6.00),
        ("ollama", ""): (0.0, 0.0),  # local = free
    }
    input_rate, output_rate = rates.get((provider, model_id), (1.0, 3.0))
    return (prompt_tokens * input_rate + completion_tokens * output_rate) / 1_000_000
