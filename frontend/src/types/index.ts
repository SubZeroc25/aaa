export interface Agent {
  id: string;
  name: string;
  role: string;
  personality: string;
  avatar_color: string;
  system_prompt: string;
  model_provider: string;
  model_id: string;
  fallback_provider: string | null;
  fallback_model_id: string | null;
  tools: Record<string, boolean>;
  permissions: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface AgentStatus {
  agent_id: string;
  name: string;
  role: string;
  avatar_color: string;
  state: "idle" | "thinking" | "writing" | "reviewing" | "blocked";
  current_task: string | null;
  mission_id: string | null;
}

export interface MissionTask {
  id: string;
  phase_id: string;
  title: string;
  description: string;
  status: string;
  assigned_agent_id: string | null;
  dependencies: string[];
  order: number;
  result: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MissionPhase {
  id: string;
  mission_id: string;
  title: string;
  description: string;
  status: string;
  order: number;
  created_at: string;
  tasks: MissionTask[];
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  status: string;
  agent_ids: string[];
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  phases: MissionPhase[];
}

export interface MissionBrief {
  id: string;
  title: string;
  status: string;
  agent_count: number;
  task_count: number;
  completed_tasks: number;
  created_at: string;
}

export interface AgentMessage {
  id: string;
  mission_id: string;
  from_agent_id: string | null;
  to_agent_id: string | null;
  message_type: string;
  content: string;
  intent: string;
  confidence: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface StreamEvent {
  event_type: string;
  agent_id: string | null;
  agent_name: string | null;
  agent_color: string | null;
  mission_id: string;
  content: string;
  metadata: Record<string, unknown>;
  timestamp: string;
}

export interface CostSummary {
  mission_id: string;
  total_cost_usd: number;
  total_tokens: number;
  by_agent: {
    agent_id: string;
    model_provider: string;
    model_id: string;
    cost_usd: number;
    total_tokens: number;
    requests: number;
  }[];
}

export interface ModelProvider {
  provider: string;
  available: boolean;
}
