import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

// Set WebSocket constructor for serverless environment compatibility
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

// Safely create Neon DB pool instance
export const pool = connectionString && !connectionString.includes("user:password")
  ? new Pool({ connectionString })
  : null;

export const db = pool ? drizzle(pool, { schema }) : null;
