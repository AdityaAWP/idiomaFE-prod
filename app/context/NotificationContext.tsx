'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { getAccessToken } from '@/lib/api';

export interface NotifEvent {
  type: 'friend_request';
  senderId: string;
  senderUsername: string;
  requestId: string;
}

interface NotificationContextValue {
  sendFriendRequest: (receiverId: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null);
  const connected = useRef(false);
  const pendingMessages = useRef<string[]>([]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    const token = getAccessToken();
    if (!token) {
      // Token not ready yet — retry in 1s
      setTimeout(connect, 1000);
      return;
    }

    const url = process.env.NEXT_PUBLIC_NOTIFICATION_WS ?? 'ws://localhost:3002/ws';
    const ws = new WebSocket(`${url}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      connected.current = true;
      // NestJS ws adapter expects: { event, data }
      ws.send(JSON.stringify({ event: 'register', data: { level: 'notif' } }));
      // Flush pending messages
      pendingMessages.current.forEach((m) => ws.send(m));
      pendingMessages.current = [];
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event === 'friend_request') {
          window.dispatchEvent(new CustomEvent('idiomamate:friend_request', { detail: msg.data }));
        }
        if (msg.event === 'match_found') {
          window.dispatchEvent(new CustomEvent('idiomamate:match_found', { detail: msg.data }));
        }
      } catch {}
    };

    ws.onclose = () => {
      connected.current = false;
      // Reconnect after 2s
      setTimeout(connect, 2000);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
      connected.current = false;
    };
  }, [connect]);

  const send = useCallback((data: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
    } else {
      pendingMessages.current.push(data);
      connect();
    }
  }, [connect]);

  const sendFriendRequest = useCallback((receiverId: string) => {
    send(JSON.stringify({
      event: 'friend_request',
      data: { receiverId },
    }));
  }, [send]);

  return (
    <NotificationContext.Provider value={{ sendFriendRequest }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used inside <NotificationProvider>');
  return ctx;
}
