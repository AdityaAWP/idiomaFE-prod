"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getAccessToken } from "@/lib/api";

export function useLobbySocket(lobbyId: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token || !lobbyId) return;

    const baseUrl = process.env.NEXT_PUBLIC_MONOLITH_WS ?? "http://localhost:3003";
    const socket = io(`${baseUrl}/lobby`, {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join_lobby", { lobbyId });
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("new_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("member_joined", (data: { userId: string }) => {
      // handled by parent if needed
    });

    socket.on("member_left", (data: { userId: string }) => {
      // handled by parent if needed
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [lobbyId]);

  const sendMessage = useCallback(
    (content: string) => {
      if (socketRef.current?.connected && lobbyId) {
        socketRef.current.emit("send_message", { lobbyId, content });
      }
    },
    [lobbyId]
  );

  const leaveLobby = useCallback(() => {
    if (socketRef.current?.connected && lobbyId) {
      socketRef.current.emit("leave_lobby", { lobbyId });
      socketRef.current.disconnect();
    }
  }, [lobbyId]);

  return { connected, messages, sendMessage, leaveLobby };
}

export function useDmSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [incomingMessages, setIncomingMessages] = useState<any[]>([]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    const baseUrl = process.env.NEXT_PUBLIC_MONOLITH_WS ?? "http://localhost:3003";
    const socket = io(`${baseUrl}/dm`, {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("new_message", (msg) => {
      setIncomingMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, []);

  const sendMessage = useCallback((receiverId: string, content: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("send_message", { receiverId, content });
    }
  }, []);

  const markRead = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("mark_read", { conversationId });
    }
  }, []);

  return { connected, incomingMessages, sendMessage, markRead };
}
