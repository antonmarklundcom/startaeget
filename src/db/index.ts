import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

/**
 * The database is optional on purpose (§4.5): with no DATABASE_URL the app must
 * still build, render and accept form submissions. Callers use `withDb`, which
 * resolves to null when there is no database and never throws at import time.
 */
let pool: mysql.Pool | null = null;
let cached: MySql2Database<typeof schema> | null = null;

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb(): MySql2Database<typeof schema> | null {
  if (!isDbConfigured()) return null;
  if (!cached) {
    pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      connectionLimit: 8,
      timezone: "Z",
    });
    cached = drizzle(pool, { schema, mode: "default" });
  }
  return cached;
}

/**
 * Runs `fn` against the database when one is configured. A missing database or
 * a failing query is logged and swallowed — no visitor ever sees a 500 because
 * MySQL is unreachable.
 */
export async function withDb<T>(
  fn: (db: MySql2Database<typeof schema>) => Promise<T>,
): Promise<T | null> {
  const db = getDb();
  if (!db) return null;
  try {
    return await fn(db);
  } catch (error) {
    console.error("[db] query failed:", error);
    return null;
  }
}

export { schema };
