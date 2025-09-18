import { ZodSchema } from 'zod'

export class HttpError extends Error { constructor(public status: number, message: string) { super(message) } }

export function json(data: any, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), { ...init, headers: { 'content-type': 'application/json', ...(init.headers||{}) } })
}

export async function parseJson<T>(req: Request, schema: ZodSchema<T>): Promise<T> {
  let body: unknown
  try { body = await req.json() } catch { throw new HttpError(400, 'Invalid JSON') }
  const res = schema.safeParse(body)
  if (!res.success) { throw new HttpError(400, res.error.issues.map(i => i.message).join('; ')) }
  return res.data
}
