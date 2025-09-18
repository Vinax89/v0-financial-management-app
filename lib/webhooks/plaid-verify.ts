// lib/webhooks/plaid-verify.ts
import { jwtVerify, importJWK, decodeJwt } from 'jose'
import type { NextRequest } from 'next/server'
import { createHash, timingSafeEqual } from 'node:crypto'
import { plaidClient } from '@/lib/plaid-client'

/** cache last JWK by kid */
const jwkCache = new Map<string, any>()

function sha256Base16(raw: string) {
  return createHash('sha256').update(raw, 'utf8').digest('hex')
}

function constEq(a: string, b: string) {
  const ab = Buffer.from(a, 'utf8')
  const bb = Buffer.from(b, 'utf8')
  if (ab.length !== bb.length) return false
  try { return timingSafeEqual(ab, bb) } catch { return false }
}

export type VerifiedWebhook = {
  payload: any
  body: string
  bodyHash: string
  kid: string
}

export async function verifyPlaidWebhook(req: NextRequest): Promise<VerifiedWebhook | null> {
  const signed = req.headers.get('plaid-verification') || req.headers.get('Plaid-Verification')
  if (!signed) return null
  const raw = await req.text() // preserve whitespace exactly
  const decodedHeader = decodeJwt(signed, { header: true }) as any
  const kid = decodedHeader?.kid as string | undefined
  if (!kid || decodedHeader?.alg !== 'ES256') return null

  let jwk = jwkCache.get(kid)
  if (!jwk) {
    const res = await plaidClient.webhookVerificationKeyGet({ key_id: kid })
    jwk = res.data.key
    jwkCache.set(kid, jwk)
  }
  const key = await importJWK(jwk, 'ES256')
  const { payload } = await jwtVerify(signed, key, { maxTokenAge: '5m' })
  const bodyHash = sha256Base16(raw)
  const claimed = (payload as any)?.request_body_sha256
  if (!claimed || !constEq(bodyHash, claimed)) return null
  return { payload, body: raw, bodyHash, kid }
}
