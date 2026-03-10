const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Agents
export const api = {
  agents: {
    list: () => request<import("@/types").Agent[]>("/agents"),
    get: (id: string) => request<import("@/types").Agent>(`/agents/${id}`),
    create: (data: Partial<import("@/types").Agent>) =>
      request<import("@/types").Agent>("/agents", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<import("@/types").Agent>) =>
      request<import("@/types").Agent>(`/agents/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/agents/${id}`, { method: "DELETE" }),
    seed: () => request<import("@/types").Agent[]>("/agents/seed", { method: "POST" }),
    statuses: () => request<import("@/types").AgentStatus[]>("/agents/statuses"),
  },

  missions: {
    list: () => request<import("@/types").MissionBrief[]>("/missions"),
    get: (id: string) => request<import("@/types").Mission>(`/missions/${id}`),
    create: (data: { title: string; description: string; agent_ids: string[]; auto_decompose?: boolean }) =>
      request<import("@/types").Mission>("/missions", { method: "POST", body: JSON.stringify(data) }),
    progress: (id: string) => request<Record<string, unknown>>(`/missions/${id}/progress`),
    executeNext: (id: string) => request<Record<string, unknown>>(`/missions/${id}/execute-next`, { method: "POST" }),
    run: (id: string) => request<Record<string, unknown>>(`/missions/${id}/run`, { method: "POST" }),
    pause: (id: string) => request<Record<string, unknown>>(`/missions/${id}/pause`, { method: "POST" }),
    resume: (id: string) => request<Record<string, unknown>>(`/missions/${id}/resume`, { method: "POST" }),
  },

  messages: {
    forMission: (missionId: string) =>
      request<import("@/types").AgentMessage[]>(`/messages/mission/${missionId}`),
    stream: (missionId: string) => request<import("@/types").StreamEvent[]>(`/messages/stream/${missionId}`),
    send: (data: { mission_id: string; content: string; message_type?: string }) =>
      request<import("@/types").AgentMessage>("/messages", { method: "POST", body: JSON.stringify(data) }),
  },

  models: {
    providers: () => request<import("@/types").ModelProvider[]>("/models/providers"),
  },

  costs: {
    forMission: (missionId: string) => request<import("@/types").CostSummary>(`/costs/mission/${missionId}`),
    summary: () => request<Record<string, unknown>>("/costs/summary"),
  },

  health: () => request<{ status: string }>("/health"),
};
