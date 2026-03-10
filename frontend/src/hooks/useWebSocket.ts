"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { StreamEvent } from "@/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

export function useConsciousnessStream(onEvent?: (event: StreamEvent) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<StreamEvent[]>([]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(`${WS_URL}/ws/stream`);

    ws.onopen = () => setConnected(true);

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data.event_type === "heartbeat" || data.event_type === "connected") return;
        const event = data as StreamEvent;
        setEvents((prev) => [...prev.slice(-499), event]);
        onEvent?.(event);
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      setConnected(false);
      // Reconnect after 3s
      setTimeout(connect, 3000);
    };

    ws.onerror = () => ws.close();

    wsRef.current = ws;
  }, [onEvent]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  return { connected, events, clearEvents: () => setEvents([]) };
}
