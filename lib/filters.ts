export function parseFilters(searchParams: Record<string, string | string[] | undefined>) {
  const pick = (k: string) => (Array.isArray(searchParams[k]) ? searchParams[k]?.[0] : searchParams[k])
  const month = pick('month')
  const from = pick('from')
  const to = pick('to')
  const q = pick('q')
  const categoryId = pick('categoryId')
  return { month, from, to, q, categoryId }
}
