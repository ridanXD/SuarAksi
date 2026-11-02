"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = void 0;
const http_1 = __importDefault(require("http"));
const app_1 = require("./app");
const socket_1 = require("./config/socket");
const env_1 = require("./config/env");
const app = (0, app_1.createApp)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
(0, socket_1.initSocketIO)(server);
server.listen(env_1.ENV.PORT, () => {
    console.log(`SuarAksi API Server is running on port ${env_1.ENV.PORT}`);
});
