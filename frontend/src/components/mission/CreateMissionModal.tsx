"use client";

import { useState } from "react";
import { useNexusStore } from "@/stores/nexusStore";

export function CreateMissionModal({ onClose }: { onClose: () => void }) {
  const { agents, createMission } = useNexusStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<string[]>(agents.map((a) => a.id));
  const [loading, setLoading] = useState(false);

  const toggleAgent = (id: string) => {
    setSelectedAgents((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return;
    setLoading(true);
    try {
      await createMission(title, description, selectedAgents);
      onClose();
    } catch (err) {
      console.error("Failed to create mission:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>New Mission</h2>

        <div className="form-group">
          <label>Mission Title</label>
          <input
            className="input"
            placeholder='e.g., "Build a SaaS Landing Page"'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Description (Grand Mission brief)</label>
          <textarea
            className="input"
            placeholder="Describe what you want to accomplish. The PM agent will decompose this into phases and tasks..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        <div className="form-group">
          <label>Agent Team ({selectedAgents.length} selected)</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
            {agents.map((agent) => (
              <button
                key={agent.id}
                className={`btn btn-sm ${selectedAgents.includes(agent.id) ? "btn-primary" : ""}`}
                onClick={() => toggleAgent(agent.id)}
                style={
                  selectedAgents.includes(agent.id)
                    ? { background: agent.avatar_color, borderColor: agent.avatar_color }
                    : undefined
                }
              >
                {agent.name} ({agent.role})
              </button>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading || !title.trim() || !description.trim()}
          >
            {loading ? "Creating & Decomposing..." : "Launch Mission"}
          </button>
        </div>
      </div>
    </div>
  );
}
