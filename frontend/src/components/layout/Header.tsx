"use client";

import { useNexusStore } from "@/stores/nexusStore";

export function Header({ connected }: { connected: boolean }) {
  const { agents, missions, activeMission } = useNexusStore();

  return (
    <header className="nexus-header">
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <h1>AGENT NEXUS</h1>
        {activeMission && (
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            // {activeMission.title}
          </span>
        )}
      </div>
      <div className="nexus-header-status">
        <span>{agents.length} agents</span>
        <span>{missions.length} missions</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span className={`status-dot ${connected ? "connected" : "disconnected"}`} />
          {connected ? "Live" : "Offline"}
        </span>
      </div>
    </header>
  );
}
