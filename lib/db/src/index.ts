import * as path from "path";
import { config } from "dotenv";

// Locally load .env file from the root directory so backend scripts have access
config({ path: path.resolve(process.cwd(), "../../.env") });
config({ path: path.resolve(process.cwd(), ".env") }); // fallback for root execution

import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL environment variable is required.");
}

// Ensure the backend uses the service role key to bypass RLS policies where necessary
// If only the publishable key is available, use that but warn.
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseKey) {
  throw new Error("Supabase Key environment variable is required.");
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey
);
