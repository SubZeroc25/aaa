"use client";

import { useState, useRef, useEffect } from "react";
import { useNexusStore } from "@/stores/nexusStore";
import { CreateMissionModal } from "@/components/mission/CreateMissionModal";
import { MissionView } from "@/components/mission/MissionView";
import { ConsciousnessStream } from "@/components/workspace/ConsciousnessStream";

export function WorkspacePanel() {
  const { activeMission, agents, streamEvents } = useNexusStore();
  const [showCreateMission, setShowCreateMission] = useState(false);
  const [tab, setTab] = useState<"stream" | "mission">("stream");

  return (
    <div className="panel">
      <div className="panel-header">
        <div style={{ display: "flex", gap: 12 }}>
          <button
            className={`btn btn-sm ${tab === "stream" ? "btn-primary" : ""}`}
            onClick={() => setTab("stream")}
          >
            Process Stream
          </button>
          <button
            className={`btn btn-sm ${tab === "mission" ? "btn-primary" : ""}`}
            onClick={() => setTab("mission")}
          >
            Mission Plan
          </button>
        </div>
        <button className="btn btn-sm btn-primary" onClick={() => setShowCreateMission(true)}>
          + New Mission
        </button>
      </div>
      <div className="panel-content">
        {tab === "stream" ? (
          <ConsciousnessStream events={streamEvents} agents={agents} />
        ) : activeMission ? (
          <MissionView mission={activeMission} />
        ) : (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>No Active Mission</div>
            <div style={{ fontSize: 13, marginBottom: 16 }}>
              Create a new mission or select one from the sidebar
            </div>
            <button className="btn btn-primary" onClick={() => setShowCreateMission(true)}>
              Create Mission
            </button>
          </div>
        )}
      </div>

      {showCreateMission && (
        <CreateMissionModal onClose={() => setShowCreateMission(false)} />
      )}
    </div>
  );
}
