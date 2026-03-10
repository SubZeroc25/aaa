"""Consciousness stream — real-time event bus for agent communication."""
import asyncio
import json
import logging
from datetime import datetime, timezone

from app.schemas.message import ConsciousnessStreamEvent

logger = logging.getLogger(__name__)

# In-memory subscribers (WebSocket connections)
_subscribers: dict[str, asyncio.Queue] = {}


async def subscribe(client_id: str) -> asyncio.Queue:
    queue: asyncio.Queue = asyncio.Queue(maxsize=1000)
    _subscribers[client_id] = queue
    logger.info(f"Client {client_id} subscribed to consciousness stream ({len(_subscribers)} total)")
    return queue


def unsubscribe(client_id: str):
    _subscribers.pop(client_id, None)
    logger.info(f"Client {client_id} unsubscribed ({len(_subscribers)} remaining)")


async def broadcast_event(event: ConsciousnessStreamEvent):
    """Broadcast an event to all connected clients."""
    data = event.model_dump_json()
    disconnected = []
    for client_id, queue in _subscribers.items():
        try:
            queue.put_nowait(data)
        except asyncio.QueueFull:
            disconnected.append(client_id)
            logger.warning(f"Queue full for {client_id}, dropping")

    for cid in disconnected:
        unsubscribe(cid)

    # Also persist to Redis for history
    try:
        from app.core.redis import get_redis
        r = await get_redis()
        await r.lpush(f"stream:{event.mission_id}", data)
        await r.ltrim(f"stream:{event.mission_id}", 0, 999)  # Keep last 1000 events
    except Exception as e:
        logger.warning(f"Failed to persist stream event to Redis: {e}")


async def get_stream_history(mission_id: str, limit: int = 100) -> list[dict]:
    """Get recent consciousness stream events for a mission."""
    try:
        from app.core.redis import get_redis
        r = await get_redis()
        events = await r.lrange(f"stream:{mission_id}", 0, limit - 1)
        return [json.loads(e) for e in events]
    except Exception:
        return []
