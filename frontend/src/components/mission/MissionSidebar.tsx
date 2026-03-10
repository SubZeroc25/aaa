"use client";

import { useNexusStore } from "@/stores/nexusStore";
import { api } from "@/lib/api";
import type { MissionBrief } from "@/types";

export function MissionSidebar() {
  const { missions, activeMission, loadMission, streamEvents } = useNexusStore();

  const handleSelect = async (mission: MissionBrief) => {
    await loadMission(mission.id);
  };

  const handleRun = async (e: React.MouseEvent, missionId: string) => {
    e.stopPropagation();
    try {
      await api.missions.run(missionId);
    } catch (err) {
      console.error("Failed to run mission:", err);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <span>Mission Timeline</span>
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
          {streamEvents.length} events
        </span>
      </div>
      <div className="panel-content">
        {missions.length === 0 ? (
          <div style={{ padding: 16, color: "var(--text-muted)", fontSize: 12, textAlign: "center" }}>
            No missions yet. Create one to get started.
          </div>
        ) : (
          missions.map((mission) => {
            const progressPct =
              mission.task_count > 0
                ? Math.round((mission.completed_tasks / mission.task_count) * 100)
                : 0;

            return (
              <div
                key={mission.id}
                className={`mission-card ${activeMission?.id === mission.id ? "active" : ""}`}
                onClick={() => handleSelect(mission)}
              >
                <div className="mission-title">{mission.title}</div>
                <div className="mission-meta">
                  <span>{mission.status}</span>
                  <span>{mission.agent_count} agents</span>
                  <span>
                    {mission.completed_tasks}/{mission.task_count} tasks
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
                </div>
                {mission.status === "active" && (
                  <div style={{ marginTop: 8 }}>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={(e) => handleRun(e, mission.id)}
                    >
                      Run All Tasks
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Active mission detail */}
        {activeMission && activeMission.phases.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div
              className="panel-header"
              style={{ position: "static", marginBottom: 8, borderRadius: 6 }}
            >
              Phases & Tasks
            </div>
            {activeMission.phases.map((phase) => (
              <div key={phase.id} className="phase-block">
                <div className="phase-title">
                  <span
                    className={`task-status-dot ${phase.status}`}
                    style={{ width: 8, height: 8 }}
                  />
                  {phase.title}
                </div>
                {phase.tasks.map((task) => (
                  <div key={task.id} className="task-item">
                    <span className={`task-status-dot ${task.status}`} />
                    <span style={{ flex: 1 }}>{task.title}</span>
                    <span
                      style={{
                        fontSize: 10,
                        color: "var(--text-muted)",
                        textTransform: "capitalize",
                      }}
                    >
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
