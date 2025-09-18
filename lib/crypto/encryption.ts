import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

const ALGO = 'aes-256-gcm'
const IV_LEN = 12 // 96-bit IV recommended for GCM

function getKey(): Buffer {
  const b64 = process.env.DATA_ENCRYPTION_KEY
  if (!b64) throw new Error('DATA_ENCRYPTION_KEY missing')
  const key = Buffer.from(b64, 'base64')
  if (key.length !== 32) throw new Error('DATA_ENCRYPTION_KEY must be 32 bytes (base64 of 32 bytes)')
  return key
}

export function encryptToString(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(IV_LEN)
  const cipher = createCipheriv(ALGO, key, iv)
  const ciphertext = Buffer.concat([cipher.update(Buffer.from(plaintext, 'utf8')), cipher.final()])
  const tag = cipher.getAuthTag()
  // v1:gcm:iv:cipher:tag — all base64
  return `v1:gcm:${iv.toString('base64')}:${ciphertext.toString('base64')}:${tag.toString('base64')}`
}

export function decryptFromString(payload: string): string {
  const [v, mode, ivB64, ctB64, tagB64] = payload.split(':')
  if (v !== 'v1' || mode !== 'gcm') throw new Error('Unsupported cipher payload')
  const key = getKey()
  const iv = Buffer.from(ivB64, 'base64')
  const ct = Buffer.from(ctB64, 'base64')
  const tag = Buffer.from(tagB64, 'base64')
  const decipher = createDecipheriv(ALGO, key, iv)
  decipher.setAuthTag(tag)
  const pt = Buffer.concat([decipher.update(ct), decipher.final()])
  return pt.toString('utf8')
}
