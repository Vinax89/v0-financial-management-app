// services/pdf-thumb/src/server.ts
import express from 'express'
import crypto from 'crypto'
import { execFile } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const app = express()
app.use(express.json({ limit: '12mb' }))

function verifySignature(secret: string, body: string, signature: string) {
  const h = crypto.createHmac('sha256', secret).update(body).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(signature || '', 'hex'))
}

app.post('/render', async (req, res) => {
  const secret = process.env.PDF_THUMBNAIL_SECRET || ''
  const raw = JSON.stringify(req.body || {})
  if (!verifySignature(secret, raw, req.header('x-signature') || '')) return res.status(403).json({ error: 'forbidden' })

  const { url, width = 640 } = req.body as { url?: string; width?: number }
  if (!url) return res.status(400).json({ error: 'url required' })

  const tmpDir = '/tmp'
  const pdf = path.join(tmpDir, 'in.pdf')
  const base = path.join(tmpDir, 'out')
  try {
    const r = await fetch(url)
    if (!r.ok) throw new Error('fetch failed')
    const b = Buffer.from(await r.arrayBuffer())
    await fs.writeFile(pdf, b)

    // pdftoppm -jpeg -singlefile -f 1 -scale-to <width> in.pdf out
    const exec = promisify(execFile)
    await exec('pdftoppm', ['-jpeg', '-singlefile', '-f', '1', '-scale-to', String(width), pdf, base])
    const jpg = await fs.readFile(base + '.jpg')
    return res.json({ jpegBase64: jpg.toString('base64') })
  } catch (e: any) {
    return res.status(500).json({ error: String(e?.message || e) })
  } finally {
    ;(async ()=>{ try { await fs.unlink(pdf); await fs.unlink(base + '.jpg') } catch {} })()
  }
})

const port = process.env.PORT || 8080
app.listen(port, () => console.log('pdf-thumb listening on', port))
