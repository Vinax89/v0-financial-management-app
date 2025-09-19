import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import * as schema from "./schema"

// Use Supabase database URL instead of Vercel Postgres
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || ""

if (!connectionString) {
  throw new Error("Database connection string not found. Please check your Supabase integration.")
}

const client = postgres(connectionString)
export const db = drizzle(client, { schema })
