import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { decryptFromString, encryptToString } from '@/lib/crypto/encryption'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
const sb = createClient(url, key)

async function* chunks<T>(arr: T[], size = 500) {
  for (let i = 0; i < arr.length; i += size) yield arr.slice(i, i + size)
}

async function run() {
  const { data, error } = await sb.from('plaid_items').select('id, access_token')
  if (error) throw error
  let rewapped = 0, skipped = 0
  for (const batch of await Promise.all([Array.from(chunks(data ?? [], 500))]).then(x => x[0])) {
    const updates: { id: string; access_token: string }[] = []
    for (const row of batch) {
      const parts = row.access_token.split(':')
      const isNew = parts.length === 6 && parts[0]==='v1' && parts[1]==='gcm' && parts[2]===process.env.DATA_ENCRYPTION_PRIMARY_KID
      if (isNew) { skipped++; continue }
      const plaintext = decryptFromString(row.access_token)
      const rewrapped = encryptToString(plaintext)
      updates.push({ id: row.id, access_token: rewrapped })
    }
    if (updates.length) {
      const { error: upErr } = await sb.from('plaid_items').upsert(updates)
      if (upErr) throw upErr
      rewapped += updates.length
      console.log('Rewrapped', updates.length, 'rows')
    }
  }
  console.log({ rewapped, skipped })
}

run().catch((e) => { console.error(e); process.exit(1) })
