"use client";

import { useEffect } from "react";
import { useNexusStore } from "@/stores/nexusStore";
import { useConsciousnessStream } from "@/hooks/useWebSocket";
import { AgentPanel } from "@/components/agents/AgentPanel";
import { WorkspacePanel } from "@/components/workspace/WorkspacePanel";
import { MissionSidebar } from "@/components/mission/MissionSidebar";
import { Header } from "@/components/layout/Header";

export default function Home() {
  const { fetchAgents, fetchMissions, addStreamEvent } = useNexusStore();
  const { connected } = useConsciousnessStream((event) => addStreamEvent(event));

  useEffect(() => {
    fetchAgents();
    fetchMissions();
  }, [fetchAgents, fetchMissions]);

  // Poll agent statuses every 5s
  const fetchStatuses = useNexusStore((s) => s.fetchStatuses);
  useEffect(() => {
    const interval = setInterval(fetchStatuses, 5000);
    return () => clearInterval(interval);
  }, [fetchStatuses]);

  return (
    <div className="nexus-layout">
      <Header connected={connected} />
      <AgentPanel />
      <WorkspacePanel />
      <MissionSidebar />
    </div>
  );
}
