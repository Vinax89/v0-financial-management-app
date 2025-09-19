export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

function base(fields: Record<string, any> = {}) {
  return { ts: new Date().toISOString(), ...fields }
}

export const log = {
  debug: (msg: string, ctx: Record<string, any> = {}) => console.debug(JSON.stringify(base({ lvl: 'debug', msg, ...ctx }))),
  info:  (msg: string, ctx: Record<string, any> = {}) => console.info(JSON.stringify(base({ lvl: 'info',  msg, ...ctx }))),
  warn:  (msg: string, ctx: Record<string, any> = {}) => console.warn(JSON.stringify(base({ lvl: 'warn',  msg, ...ctx }))),
  error: (msg: string, ctx: Record<string, any> = {}) => console.error(JSON.stringify(base({ lvl: 'error', msg, ...ctx }))),
}

export function requestIdFrom(headers: Headers) {
  return headers.get('x-request-id') || headers.get('x-vercel-id') || ''
}
