import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const sb = createClient(url, key);

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, '006_create_plaid_integration_schema.sql'), 'utf-8');
  const statements = sql.split(';').filter(s => s.trim().length > 0);

  for (const statement of statements) {
    const { error } = await sb.rpc('eval', { query: statement });
    if (error) {
      console.error(`Failed to execute statement: "${statement}"`, error);
      process.exit(1);
    }
  }

  console.log('Migration successful!');
}

run();
