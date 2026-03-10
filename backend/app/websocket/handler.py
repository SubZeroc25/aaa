"""WebSocket handler for the consciousness stream and agent status."""
import asyncio
import json
import uuid

from fastapi import WebSocket, WebSocketDisconnect

from app.services.orchestration.stream import subscribe, unsubscribe


async def consciousness_stream_ws(websocket: WebSocket):
    """WebSocket endpoint for real-time agent communication visibility."""
    await websocket.accept()
    client_id = str(uuid.uuid4())
    queue = await subscribe(client_id)

    try:
        # Send initial connection confirmation
        await websocket.send_json({
            "event_type": "connected",
            "client_id": client_id,
            "content": "Connected to consciousness stream",
        })

        # Listen for events and forward to client
        while True:
            try:
                data = await asyncio.wait_for(queue.get(), timeout=30.0)
                await websocket.send_text(data)
            except asyncio.TimeoutError:
                # Send heartbeat to keep connection alive
                await websocket.send_json({"event_type": "heartbeat"})
            except WebSocketDisconnect:
                break
    except (WebSocketDisconnect, RuntimeError):
        pass
    finally:
        unsubscribe(client_id)
