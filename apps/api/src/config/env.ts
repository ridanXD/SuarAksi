import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres@localhost:5432/suaraksi_db",
  JWT_SECRET: process.env.JWT_SECRET || "suaraksi_super_secret_jwt_key_2026_secure",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  UPLOAD_DIR: process.env.UPLOAD_DIR || "./uploads",
};
