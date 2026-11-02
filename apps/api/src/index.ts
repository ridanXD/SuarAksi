import http from "http";
import { createApp } from "./app";
import { initSocketIO } from "./config/socket";
import { ENV } from "./config/env";

const app = createApp();
const server = http.createServer(app);

initSocketIO(server);

server.listen(ENV.PORT, () => {
  console.log(`SuarAksi API Server is running on port ${ENV.PORT}`);
});

export { app, server };
