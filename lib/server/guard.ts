export async function withBudget<T>(label: string, ms: number, fn: () => Promise<T>): Promise<T> {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), ms)
  try {
    const res = await fn()
    return res
  } finally {
    clearTimeout(t)
  }
}
