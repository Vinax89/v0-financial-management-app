export function parseFilters(searchParams: Record<string, string | string[] | undefined>) {
  const get = (k: string) => (Array.isArray(searchParams[k]) ? searchParams[k]?.[0] : searchParams[k])
  const getAll = (k: string) => {
    const v = searchParams[k]
    if (Array.isArray(v)) return v
    // Support query like ?categoryIds=uuid1,uuid2
    if (typeof v === 'string' && v.includes(',')) return v.split(',').filter(Boolean)
    return v ? [v] : []
  }
  const month = get('month')
  const from = get('from')
  const to = get('to')
  const q = get('q')
  const categoryIds = getAll('categoryIds')
  const amountMin = get('amountMin')
  const amountMax = get('amountMax')
  const amountMode = get('amountMode') || 'signed' // 'signed' | 'absolute'
  return { month, from, to, q, categoryIds, amountMin, amountMax, amountMode }
}
