import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { ENV } from "./env";

interface DecodedToken {
  id: string;
  role: string;
}

let ioInstance: SocketIOServer | null = null;

export function initSocketIO(server: HttpServer): SocketIOServer {
  const io = new SocketIOServer(server, {
    cors: {
      origin: ENV.CORS_ORIGIN,
      methods: ["GET", "POST", "PATCH", "DELETE"],
      credentials: true,
    },
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return next();
    }
    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as DecodedToken;
      socket.data.user = decoded;
      return next();
    } catch {
      return next();
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = socket.data.user;
    if (user?.id) {
      socket.join(`user:${user.id}`);
    }

    socket.on("join_report", (reportId: string) => {
      socket.join(`report:${reportId}`);
    });

    socket.on("leave_report", (reportId: string) => {
      socket.leave(`report:${reportId}`);
    });
  });

  ioInstance = io;
  return io;
}

export function getIO(): SocketIOServer | null {
  return ioInstance;
}

export function emitToUser(userId: string, event: string, payload: unknown) {
  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit(event, payload);
  }
}

export function emitToReport(reportId: string, event: string, payload: unknown) {
  if (ioInstance) {
    ioInstance.to(`report:${reportId}`).emit(event, payload);
  }
}

export function emitBroadcast(event: string, payload: unknown) {
  if (ioInstance) {
    ioInstance.emit(event, payload);
  }
}
