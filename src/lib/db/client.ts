import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * The only file in the codebase allowed to import "@neondatabase/serverless".
 * Swapping to a different Postgres host later means rewriting this file only.
 */
let instance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!instance) {
    const url = process.env.NEON_DATABASE_URL;
    if (!url) throw new Error("Missing env var: NEON_DATABASE_URL");
    instance = drizzle({ client: neon(url), schema });
  }
  return instance;
}
