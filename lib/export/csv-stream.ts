import { PassThrough } from 'node:stream'

export function createCsvStream<T extends Record<string, any>>(columns: string[]) {
  const stream = new PassThrough()
  // write header once
  queueMicrotask(() => {
    stream.write(columns.join(',') + '\n')
  })
  const esc = (v: any) => {
    if (v === null || v === undefined) return ''
    const s = String(v)
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
  }
  const writeRows = (rows: T[]) => {
    for (const r of rows) {
      const line = columns.map(c => esc((r as any)[c])).join(',') + '\n'
      if (!stream.write(line)) return false // backpressure; caller should wait for 'drain'
    }
    return true
  }
  const end = () => stream.end()
  return { stream, writeRows, end }
}
