"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getAccessToken } from "@/lib/api";

export interface MatchFoundPayload {
  channelName: string;
  user1Id: string;
  user2Id: string;
  token: string;
  myTopics: string[];
  partnerTopics: string[];
}

type ConnectionStatus = "disconnected" | "connecting" | "connected";

export function useMatchWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [matchFound, setMatchFound] = useState<MatchFoundPayload | null>(null);
  const statusRef = useRef<ConnectionStatus>("disconnected");

  const connect = useCallback((level: string) => {
    const token = getAccessToken();
    if (!token) return Promise.resolve(false);

    const envUrl = process.env.NEXT_PUBLIC_NOTIFICATION_WS;
    let url: string;
    if (typeof window !== 'undefined') {
      if (envUrl && envUrl.includes('localhost') && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        url = `ws://${window.location.hostname}:3002/ws`;
      } else {
        url = envUrl ?? `ws://${window.location.hostname}:3002/ws`;
      }
    } else {
      url = envUrl ?? "ws://localhost:3002/ws";
    }
    const wsUrl = `${url}?token=${token}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    setStatus("connecting");
    statusRef.current = "connecting";

    return new Promise<boolean>((resolve) => {
      ws.onopen = () => {
        setStatus("connected");
        statusRef.current = "connected";
        ws.send(JSON.stringify({ event: "register", data: { level } }));
        resolve(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.event === "match_found") {
            setMatchFound(msg.data as MatchFoundPayload);
          }
          if (msg.event === "friend_request") {
            // Dispatch a custom event so the Navbar can pick it up
            window.dispatchEvent(new CustomEvent("idiomamate:friend_request", {
              detail: msg.data,
            }));
          }
        } catch {
          // ignore non-JSON messages
        }
      };

      ws.onerror = () => {
        resolve(false);
      };

      ws.onclose = (e) => {
        console.log('Match WS closed', e.code, e.reason);
        setStatus("disconnected");
        statusRef.current = "disconnected";
        wsRef.current = null;
      };
    });
  }, []);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    setStatus("disconnected");
    statusRef.current = "disconnected";
    setMatchFound(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  return {
    status,
    matchFound,
    connect,
    disconnect,
    clearMatch: () => setMatchFound(null),
  };
}
