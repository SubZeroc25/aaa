# Agent Nexus

A unified multi-agent creative command center where AI agents with distinct personalities collaborate in real-time on complex missions.

## Quick Start

```bash
# 1. Copy environment config
cp .env.example .env
# Edit .env with your API keys

# 2. Start all services
docker-compose up --build

# 3. Open the dashboard
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/docs
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                     │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────────┐  │
│  │ Agent Panel  │ │  Workspace   │ │ Mission Sidebar  │  │
│  │  (Network)   │ │  (Stream +   │ │  (Timeline +     │  │
│  │              │ │   Mission)   │ │   Tasks)         │  │
│  └──────┬───────┘ └──────┬───────┘ └────────┬─────────┘  │
│         └────────────────┼──────────────────┘            │
│                     WebSocket + REST                      │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────┐
│                   Backend (FastAPI)                       │
│  ┌─────────────┐ ┌───────────────┐ ┌─────────────────┐  │
│  │   Model      │ │ Orchestration │ │    Mission      │  │
│  │  Adapters    │ │   Engine      │ │   Service       │  │
│  │ (5 providers)│ │ (state machine│ │ (decompose +    │  │
│  │              │ │  + collab)    │ │   execute)      │  │
│  └──────────────┘ └───────────────┘ └─────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐ │
│  │         Consciousness Stream (event bus)              │ │
│  └──────────────────────────────────────────────────────┘ │
└──────────┬─────────────────────────────┬────────────────┘
           │                             │
    ┌──────┴──────┐               ┌──────┴──────┐
    │  PostgreSQL  │               │    Redis     │
    │  (persistent │               │  (state +    │
    │   storage)   │               │   pub/sub)   │
    └─────────────┘               └─────────────┘
```

## Features

- **Model Agnostic**: OpenAI, Anthropic, Google, Mistral, and Ollama (local) with per-agent assignment and fallback chains
- **6 Specialized Agents**: Project Manager, Architect, Code Writer, Creative, Researcher, Reviewer — each with unique personality and skills
- **Mission System**: Auto-decomposition of complex objectives into phases and tasks
- **Collaboration Protocols**: Handoff, consultation, review loops, and swarm mode
- **Real-Time Visibility**: Consciousness stream shows all agent communications live via WebSocket
- **Cost Intelligence**: Per-agent, per-model token tracking and cost estimation
- **Dark Mode Command Center**: Three-panel UI with agent network, workspace, and mission timeline

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/health` | Health check |
| `GET /api/agents` | List all agents |
| `POST /api/agents/seed` | Initialize default agent team |
| `POST /api/missions` | Create and decompose a mission |
| `POST /api/missions/{id}/run` | Execute all tasks in background |
| `GET /api/missions/{id}/progress` | Mission progress stats |
| `GET /api/costs/mission/{id}` | Cost breakdown |
| `WS /ws/stream` | Real-time consciousness stream |

See full API docs at `http://localhost:8000/docs` when running.

## Development

```bash
# Backend only
cd backend && pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend only
cd frontend && npm install && npm run dev
```
