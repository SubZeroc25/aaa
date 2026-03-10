"use client";

import { useState } from "react";
import { useNexusStore } from "@/stores/nexusStore";
import { AgentNode } from "./AgentNode";
import type { Agent } from "@/types";

export function AgentPanel() {
  const { agents, agentStatuses, seedAgents, loadingAgents } = useNexusStore();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const getStatus = (agentId: string) =>
    agentStatuses.find((s) => s.agent_id === agentId);

  return (
    <div className="panel">
      <div className="panel-header">
        <span>Agent Network</span>
        {agents.length === 0 && (
          <button className="btn btn-sm btn-primary" onClick={seedAgents}>
            Initialize Team
          </button>
        )}
      </div>
      <div className="panel-content">
        {loadingAgents && <div style={{ padding: 16, color: "var(--text-muted)" }}>Loading...</div>}
        {agents.map((agent) => (
          <AgentNode
            key={agent.id}
            agent={agent}
            status={getStatus(agent.id)}
            selected={selectedAgent?.id === agent.id}
            onClick={() => setSelectedAgent(selectedAgent?.id === agent.id ? null : agent)}
          />
        ))}
        {selectedAgent && (
          <div style={{ padding: 12, borderTop: "1px solid var(--border)", marginTop: 8 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>PERSONALITY</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12 }}>
              {selectedAgent.personality}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>MODEL</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12 }}>
              {selectedAgent.model_provider} / {selectedAgent.model_id}
              {selectedAgent.fallback_provider && (
                <span style={{ color: "var(--text-muted)" }}>
                  {" "}(fallback: {selectedAgent.fallback_provider}/{selectedAgent.fallback_model_id})
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>TOOLS</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {Object.entries(selectedAgent.tools)
                .filter(([, v]) => v)
                .map(([k]) => (
                  <span key={k} className="agent-state" style={{ fontSize: 10 }}>
                    {k}
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
