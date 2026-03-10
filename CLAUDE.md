# CLAUDE.md

This file provides guidance for AI assistants working in the Agent Nexus repository.

## Project Overview

**Agent Nexus** is a unified multi-agent creative command center where AI agents with distinct personalities collaborate in real-time on complex missions. It is a containerized full-stack application.

## Tech Stack

- **Backend**: Python 3.12, FastAPI, SQLAlchemy (async), PostgreSQL, Redis
- **Frontend**: Next.js 15, React 19, TypeScript, Zustand (state management)
- **Infrastructure**: Docker Compose (postgres, redis, backend, frontend)
- **Real-time**: WebSockets for consciousness stream (agent communication bus)

## Directory Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py                        # FastAPI app entry point
│   │   ├── api/routes/                    # REST API endpoints
│   │   │   ├── agents.py                  # CRUD + status for agents
│   │   │   ├── missions.py                # Mission lifecycle + execution
│   │   │   ├── messages.py                # Message history + stream
│   │   │   ├── models.py                  # Provider availability
│   │   │   └── costs.py                   # Cost tracking analytics
│   │   ├── core/                          # Config, database, redis setup
│   │   ├── models/                        # SQLAlchemy ORM models
│   │   ├── schemas/                       # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── agents/                    # Agent CRUD, defaults, memory
│   │   │   ├── models_adapters/           # Model-agnostic API layer
│   │   │   │   ├── base.py                # Abstract ModelAdapter + ModelResponse
│   │   │   │   ├── registry.py            # Adapter registry + fallback logic
│   │   │   │   ├── openai_adapter.py
│   │   │   │   ├── anthropic_adapter.py
│   │   │   │   ├── google_adapter.py
│   │   │   │   ├── mistral_adapter.py
│   │   │   │   └── ollama_adapter.py
│   │   │   ├── orchestration/             # Agent state machine + event bus
│   │   │   │   ├── engine.py              # run_agent_on_task, consultation, review_loop
│   │   │   │   └── stream.py              # Consciousness stream (pub/sub)
│   │   │   └── missions/                  # Mission decomposition + execution
│   │   └── websocket/                     # WebSocket handler
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/                           # Next.js app router (layout + page)
│   │   ├── components/
│   │   │   ├── agents/                    # AgentPanel, AgentNode
│   │   │   ├── workspace/                 # WorkspacePanel, ConsciousnessStream
│   │   │   ├── mission/                   # MissionSidebar, MissionView, CreateMissionModal
│   │   │   └── layout/                    # Header
│   │   ├── hooks/useWebSocket.ts          # WebSocket hook for consciousness stream
│   │   ├── lib/api.ts                     # REST API client
│   │   ├── stores/nexusStore.ts           # Zustand global state
│   │   ├── types/index.ts                 # TypeScript interfaces
│   │   └── styles/globals.css             # Dark theme command center CSS
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── .gitignore
```

## Running the Application

```bash
# Full stack
cp .env.example .env   # Add your API keys
docker-compose up --build

# Backend only (dev)
cd backend && pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend only (dev)
cd frontend && npm install && npm run dev
```

Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Key Architectural Patterns

### Model Adapter Pattern
All AI model providers implement `ModelAdapter` (in `services/models_adapters/base.py`). New providers are added by:
1. Creating a new `*_adapter.py` implementing `ModelAdapter.chat()` and `is_available()`
2. Registering it in `registry.py:init_adapters()`

The `chat_with_fallback()` function handles automatic provider failover.

### Agent Orchestration
The orchestration engine (`services/orchestration/engine.py`) manages agent state transitions:
- `idle` → `thinking` → `writing` → `idle`
- Collaboration protocols: `run_agent_on_task`, `run_consultation`, `run_review_loop`

Agent state is stored in Redis (ephemeral), while messages and memory are in PostgreSQL (persistent).

### Consciousness Stream
All agent events are broadcast via an in-memory pub/sub (`services/orchestration/stream.py`) to WebSocket clients, and persisted to Redis (last 1000 events per mission).

### Mission Lifecycle
1. User creates mission → status: `planning`
2. PM agent decomposes into phases/tasks → status: `active`
3. Tasks execute sequentially per phase → status: `completed`

### Frontend State
Zustand store (`stores/nexusStore.ts`) manages global state. Components subscribe to slices. WebSocket events feed into `streamEvents`.

## Conventions

### Backend
- All database operations use async SQLAlchemy sessions
- Route handlers in `api/routes/`, business logic in `services/`
- Pydantic schemas separate from ORM models
- Use `UUID` primary keys throughout
- Cost estimation in `orchestration/engine.py:_estimate_cost()`

### Frontend
- `"use client"` directive on all interactive components
- CSS-in-JS avoided; global CSS with CSS custom properties (variables)
- Components organized by domain: `agents/`, `workspace/`, `mission/`, `layout/`
- API calls via `lib/api.ts` (typed REST client)

### Git
- Branch pattern: `claude/<description>-<session-id>`
- Imperative commit messages
- Push with `-u` flag: `git push -u origin <branch>`
- Never commit `.env` or secrets

### Adding a New Agent Role
1. Add definition in `backend/app/services/agents/defaults.py`
2. Include system prompt, personality, tools, and permissions
3. Seed via `POST /api/agents/seed`

### Adding a New Model Provider
1. Create `backend/app/services/models_adapters/<provider>_adapter.py`
2. Implement `ModelAdapter` interface
3. Register in `registry.py:init_adapters()`
4. Add API key to `core/config.py` and `.env.example`
5. Add cost rates to `orchestration/engine.py:_estimate_cost()`

## Environment Variables

See `.env.example` for all configurable values. At minimum, set one model provider API key (or configure Ollama for local-only usage).
