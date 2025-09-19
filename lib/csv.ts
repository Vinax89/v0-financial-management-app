export interface CSVParseOptions {
  delimiter?: string
  skipEmptyLines?: boolean
  headers?: boolean
}

export interface CSVRow {
  [key: string]: string
}

export function parseCSV(csvText: string, options: CSVParseOptions = {}): CSVRow[] {
  const { delimiter = ",", skipEmptyLines = true, headers = true } = options

  const lines = csvText.split("\n")
  if (skipEmptyLines) {
    lines.filter((line) => line.trim() !== "")
  }

  if (lines.length === 0) return []

  const headerRow = headers ? lines[0].split(delimiter).map((h) => h.trim()) : []
  const dataRows = headers ? lines.slice(1) : lines

  return dataRows.map((line, index) => {
    const values = line.split(delimiter).map((v) => v.trim())
    const row: CSVRow = {}

    if (headers && headerRow.length > 0) {
      headerRow.forEach((header, i) => {
        row[header] = values[i] || ""
      })
    } else {
      values.forEach((value, i) => {
        row[`column_${i}`] = value
      })
    }

    return row
  })
}

export function toCSV(data: any[], headers?: string[]): string {
  if (data.length === 0) return ""

  const keys = headers || Object.keys(data[0])
  const csvHeaders = keys.join(",")

  const csvRows = data.map((row) => {
    return keys
      .map((key) => {
        const value = row[key]
        // Escape commas and quotes in values
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value || ""
      })
      .join(",")
  })

  return [csvHeaders, ...csvRows].join("\n")
}

export function downloadCSV(data: any[], filename: string, headers?: string[]): void {
  const csvContent = toCSV(data, headers)
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
