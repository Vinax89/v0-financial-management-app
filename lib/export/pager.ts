export type PageFetcher<T> = (offset: number, limit: number) => Promise<T[]>

export async function* paginate<T>(fetcher: PageFetcher<T>, pageSize = 5000) {
  let offset = 0
  while (true) {
    const rows = await fetcher(offset, pageSize)
    if (!rows.length) break
    yield rows
    offset += rows.length
    if (rows.length < pageSize) break
  }
}
