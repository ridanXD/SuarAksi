"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketIO = initSocketIO;
exports.getIO = getIO;
exports.emitToUser = emitToUser;
exports.emitToReport = emitToReport;
exports.emitBroadcast = emitBroadcast;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("./env");
let ioInstance = null;
function initSocketIO(server) {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: env_1.ENV.CORS_ORIGIN,
            methods: ["GET", "POST", "PATCH", "DELETE"],
            credentials: true,
        },
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            return next();
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.ENV.JWT_SECRET);
            socket.data.user = decoded;
            return next();
        }
        catch {
            return next();
        }
    });
    io.on("connection", (socket) => {
        const user = socket.data.user;
        if (user?.id) {
            socket.join(`user:${user.id}`);
        }
        socket.on("join_report", (reportId) => {
            socket.join(`report:${reportId}`);
        });
        socket.on("leave_report", (reportId) => {
            socket.leave(`report:${reportId}`);
        });
    });
    ioInstance = io;
    return io;
}
function getIO() {
    return ioInstance;
}
function emitToUser(userId, event, payload) {
    if (ioInstance) {
        ioInstance.to(`user:${userId}`).emit(event, payload);
    }
}
function emitToReport(reportId, event, payload) {
    if (ioInstance) {
        ioInstance.to(`report:${reportId}`).emit(event, payload);
    }
}
function emitBroadcast(event, payload) {
    if (ioInstance) {
        ioInstance.emit(event, payload);
    }
}
