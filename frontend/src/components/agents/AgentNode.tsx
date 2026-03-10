"use client";

import type { Agent, AgentStatus } from "@/types";

interface AgentNodeProps {
  agent: Agent;
  status?: AgentStatus;
  selected: boolean;
  onClick: () => void;
}

export function AgentNode({ agent, status, selected, onClick }: AgentNodeProps) {
  const state = status?.state || "idle";
  const initials = agent.name.slice(0, 2).toUpperCase();

  return (
    <div
      className="agent-node"
      onClick={onClick}
      style={selected ? { background: "var(--bg-hover)" } : undefined}
    >
      <div className="agent-avatar" style={{ background: agent.avatar_color }}>
        {initials}
        <div className={`state-ring ${state !== "idle" ? state : ""}`} />
      </div>
      <div className="agent-info">
        <div className="agent-name">{agent.name}</div>
        <div className="agent-role">{agent.role}</div>
      </div>
      {state !== "idle" && (
        <span className={`agent-state ${state}`}>{state}</span>
      )}
    </div>
  );
}
