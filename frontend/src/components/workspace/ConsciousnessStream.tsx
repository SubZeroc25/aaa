"use client";

import { useEffect, useRef } from "react";
import type { Agent, StreamEvent } from "@/types";

interface Props {
  events: StreamEvent[];
  agents: Agent[];
}

export function ConsciousnessStream({ events, agents }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events.length]);

  const getAgentColor = (agentId: string | null) => {
    if (!agentId) return "var(--text-muted)";
    return agents.find((a) => a.id === agentId)?.avatar_color || "var(--text-muted)";
  };

  const formatTime = (ts: string) => {
    try {
      return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return "";
    }
  };

  if (events.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
        <div style={{ fontSize: 18, marginBottom: 8 }}>Consciousness Stream</div>
        <div style={{ fontSize: 13 }}>
          Agent communications will appear here in real-time when a mission is running.
        </div>
      </div>
    );
  }

  return (
    <div>
      {events.map((event, idx) => (
        <div key={idx} className="stream-event">
          <div className="event-header">
            {event.agent_name && (
              <>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: event.agent_color || getAgentColor(event.agent_id),
                    display: "inline-block",
                  }}
                />
                <span style={{ color: event.agent_color || getAgentColor(event.agent_id) }}>
                  {event.agent_name}
                </span>
              </>
            )}
            <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
              {event.event_type === "status_change" ? "status" : event.event_type}
            </span>
            <span className="event-time">{formatTime(event.timestamp)}</span>
          </div>
          <div className="event-content">{event.content}</div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
