"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./auth-context";

interface SocketNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
}

interface SocketContextType {
  socket: Socket | null;
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  latestNotification: SocketNotification | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] = useState<SocketNotification | null>(null);

  useEffect(() => {
    if (!user || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
    const s = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    s.on("connect", () => {});

    s.on("new_notification", (notif: SocketNotification) => {
      setUnreadCount((prev) => prev + 1);
      setLatestNotification(notif);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [user, token]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        unreadCount,
        setUnreadCount,
        latestNotification,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket harus digunakan di dalam SocketProvider");
  }
  return context;
}
