"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Mission, CostSummary } from "@/types";
import { useNexusStore } from "@/stores/nexusStore";

export function MissionView({ mission }: { mission: Mission }) {
  const [costs, setCosts] = useState<CostSummary | null>(null);
  const { agents } = useNexusStore();

  useEffect(() => {
    api.costs.forMission(mission.id).then(setCosts).catch(() => {});
  }, [mission.id]);

  const totalTasks = mission.phases.reduce((sum, p) => sum + p.tasks.length, 0);
  const completedTasks = mission.phases.reduce(
    (sum, p) => sum + p.tasks.filter((t) => t.status === "completed").length,
    0
  );
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getAgentName = (id: string | null) =>
    id ? agents.find((a) => a.id === id)?.name || "Unknown" : "Unassigned";

  return (
    <div style={{ padding: 8 }}>
      {/* Mission header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span
            className={`agent-state ${mission.status}`}
            style={{ textTransform: "uppercase", fontSize: 10 }}
          >
            {mission.status}
          </span>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {completedTasks}/{totalTasks} tasks complete ({progressPct}%)
          </span>
          {costs && costs.total_cost_usd > 0 && (
            <span className="cost-chip">${costs.total_cost_usd.toFixed(4)}</span>
          )}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          {mission.description}
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar" style={{ height: 6, marginBottom: 16 }}>
        <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Phases */}
      {mission.phases.map((phase) => (
        <div key={phase.id} className="phase-block">
          <div className="phase-title">
            <span
              className={`task-status-dot ${phase.status}`}
              style={{ width: 8, height: 8 }}
            />
            <span style={{ flex: 1 }}>{phase.title}</span>
            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
              {phase.tasks.filter((t) => t.status === "completed").length}/{phase.tasks.length}
            </span>
          </div>
          {phase.tasks.map((task) => (
            <div key={task.id} className="task-item">
              <span className={`task-status-dot ${task.status}`} />
              <span style={{ flex: 1 }}>{task.title}</span>
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                {getAgentName(task.assigned_agent_id)}
              </span>
            </div>
          ))}
        </div>
      ))}

      {/* Cost breakdown */}
      {costs && costs.by_agent.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>
            COST BREAKDOWN
          </div>
          {costs.by_agent.map((entry, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "4px 0",
                fontSize: 12,
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span>
                {getAgentName(entry.agent_id)} ({entry.model_provider}/{entry.model_id})
              </span>
              <span className="cost-chip">
                ${entry.cost_usd.toFixed(4)} | {entry.total_tokens.toLocaleString()} tok
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
