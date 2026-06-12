import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const hasDb = Boolean(process.env.DATABASE_URL);

export const pool = hasDb ? new Pool({ connectionString: process.env.DATABASE_URL }) : null;
const realDb = hasDb ? drizzle(pool!, { schema }) : null;
export const db = (hasDb
  ? realDb!
  : new Proxy({} as any, {
      get(target, prop) {
        return () => {
          throw new Error("Database query failed: DATABASE_URL environment variable is required but was not provided.");
        };
      }
    })) as NonNullable<typeof realDb>;

export * from "./schema";
