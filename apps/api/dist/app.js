"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({
        origin: [env_1.ENV.CORS_ORIGIN, "http://localhost:3000"],
        credentials: true,
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }));
    app.use(express_1.default.json({ limit: "15mb" }));
    app.use(express_1.default.urlencoded({ extended: true, limit: "15mb" }));
    const uploadsPath = path_1.default.resolve(process.cwd(), env_1.ENV.UPLOAD_DIR);
    app.use("/uploads", express_1.default.static(uploadsPath));
    app.get("/api/health", (req, res) => {
        res.status(200).json({
            status: "ok",
            timestamp: new Date().toISOString(),
            service: "suaraksi-api",
        });
    });
    app.use("/api", routes_1.default);
    app.use(errorHandler_1.errorHandler);
    return app;
}
