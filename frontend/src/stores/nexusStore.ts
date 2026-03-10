"use client";

import { create } from "zustand";
import type { Agent, AgentStatus, Mission, MissionBrief, StreamEvent } from "@/types";
import { api } from "@/lib/api";

interface NexusState {
  // Agents
  agents: Agent[];
  agentStatuses: AgentStatus[];
  loadingAgents: boolean;
  fetchAgents: () => Promise<void>;
  fetchStatuses: () => Promise<void>;
  seedAgents: () => Promise<void>;

  // Missions
  missions: MissionBrief[];
  activeMission: Mission | null;
  loadingMissions: boolean;
  fetchMissions: () => Promise<void>;
  setActiveMission: (mission: Mission | null) => void;
  loadMission: (id: string) => Promise<void>;
  createMission: (title: string, description: string, agentIds: string[]) => Promise<Mission>;

  // Stream
  streamEvents: StreamEvent[];
  addStreamEvent: (event: StreamEvent) => void;
  clearStream: () => void;

  // UI
  activePanel: "agents" | "mission" | "workspace";
  setActivePanel: (panel: "agents" | "mission" | "workspace") => void;
}

export const useNexusStore = create<NexusState>((set, get) => ({
  // Agents
  agents: [],
  agentStatuses: [],
  loadingAgents: false,
  fetchAgents: async () => {
    set({ loadingAgents: true });
    try {
      const agents = await api.agents.list();
      set({ agents, loadingAgents: false });
    } catch {
      set({ loadingAgents: false });
    }
  },
  fetchStatuses: async () => {
    try {
      const statuses = await api.agents.statuses();
      set({ agentStatuses: statuses });
    } catch {
      // ignore
    }
  },
  seedAgents: async () => {
    const agents = await api.agents.seed();
    set({ agents });
  },

  // Missions
  missions: [],
  activeMission: null,
  loadingMissions: false,
  fetchMissions: async () => {
    set({ loadingMissions: true });
    try {
      const missions = await api.missions.list();
      set({ missions, loadingMissions: false });
    } catch {
      set({ loadingMissions: false });
    }
  },
  setActiveMission: (mission) => set({ activeMission: mission }),
  loadMission: async (id: string) => {
    const mission = await api.missions.get(id);
    set({ activeMission: mission });
  },
  createMission: async (title: string, description: string, agentIds: string[]) => {
    const mission = await api.missions.create({
      title,
      description,
      agent_ids: agentIds,
      auto_decompose: true,
    });
    set({ activeMission: mission });
    get().fetchMissions();
    return mission;
  },

  // Stream
  streamEvents: [],
  addStreamEvent: (event) =>
    set((s) => ({ streamEvents: [...s.streamEvents.slice(-499), event] })),
  clearStream: () => set({ streamEvents: [] }),

  // UI
  activePanel: "agents",
  setActivePanel: (panel) => set({ activePanel: panel }),
}));
