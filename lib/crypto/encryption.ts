import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

const ALGO = 'aes-256-gcm'
const IV_LEN = 12
type Keyring = Record<string, Buffer>
function getKeyring(): { primaryKid: string; ring: Keyring } {
  const raw = process.env.DATA_ENCRYPTION_KEYS
  const primaryKid = process.env.DATA_ENCRYPTION_PRIMARY_KID
  if (!raw || !primaryKid) throw new Error('Encryption keyring env missing')
  const ring: Keyring = {}
  for (const pair of raw.split(',')) {
    const [kid, b64] = pair.split(':')
    if (!kid || !b64) continue
    const buf = Buffer.from(b64, 'base64')
    if (buf.length !== 32) throw new Error(`Key ${kid} must be 32 bytes`)
    ring[kid] = buf
  }
  if (!ring[primaryKid]) throw new Error('Primary KID not present in ring')
  return { primaryKid, ring }
}

export function encryptToString(plaintext: string): string {
  const { primaryKid, ring } = getKeyring()
  const key = ring[primaryKid]
  const iv = randomBytes(IV_LEN)
  const cipher = createCipheriv(ALGO, key, iv)
  const ciphertext = Buffer.concat([cipher.update(Buffer.from(plaintext, 'utf8')), cipher.final()])
  const tag = cipher.getAuthTag()
  return `v1:gcm:${primaryKid}:${iv.toString('base64')}:${ciphertext.toString('base64')}:${tag.toString('base64')}`
}

export function decryptFromString(payload: string): string {
  const parts = payload.split(':')
  if (parts[0] !== 'v1' || parts[1] !== 'gcm') throw new Error('Unsupported cipher payload')
  const { ring } = getKeyring()
  let kid: string | undefined, ivB64: string, ctB64: string, tagB64: string
  if (parts.length === 6) { ;[, , kid, ivB64, ctB64, tagB64] = parts as any }
  else if (parts.length === 5) { ;[, , ivB64, ctB64, tagB64] = parts as any }
  else throw new Error('Malformed payload')
  const iv = Buffer.from(ivB64, 'base64')
  const ct = Buffer.from(ctB64, 'base64')
  const tag = Buffer.from(tagB64, 'base64')
  const candidates = kid ? [ring[kid]].filter(Boolean) : Object.values(ring)
  for (const key of candidates) {
    try {
      const decipher = createDecipheriv(ALGO, key!, iv)
      decipher.setAuthTag(tag)
      const pt = Buffer.concat([decipher.update(ct), decipher.final()])
      return pt.toString('utf8')
    } catch {}
  }
  throw new Error('Decryption failed for all keys')
}
