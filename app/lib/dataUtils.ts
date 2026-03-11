/**
 * Client-side data utilities — column type detection, stats, anomaly flagging
 */

export type ColType = 'numeric' | 'categorical' | 'date'

export interface ColumnMeta {
  name: string
  type: ColType
  uniqueCount: number
  missingCount: number
  sample: string[]
}

export interface DataQualityIssue {
  issue: string
  severity: 'low' | 'medium' | 'high'
}

/** Detect column type from sample values */
export function detectColType(values: string[]): ColType {
  const nonEmpty = values.filter(v => v?.trim())
  if (!nonEmpty.length) return 'categorical'

  const numericCount = nonEmpty.filter(v => !isNaN(Number(v.replace(/[$,%]/g, '')))).length
  if (numericCount / nonEmpty.length > 0.8) return 'numeric'

  const datePatterns = [/^\d{4}-\d{2}-\d{2}/, /^\d{1,2}\/\d{1,2}\/\d{2,4}/, /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i, /^q[1-4]/i]
  const dateCount = nonEmpty.filter(v => datePatterns.some(p => p.test(v.trim()))).length
  if (dateCount / nonEmpty.length > 0.5) return 'date'

  return 'categorical'
}

/** Analyze all columns in a dataset */
export function analyzeColumns(data: Record<string, string>[]): ColumnMeta[] {
  if (!data.length) return []
  const cols = Object.keys(data[0])

  return cols.map(name => {
    const values = data.map(r => r[name] ?? '')
    const nonEmpty = values.filter(v => v.trim())
    const unique = new Set(nonEmpty)
    return {
      name,
      type: detectColType(values.slice(0, 50)),
      uniqueCount: unique.size,
      missingCount: values.length - nonEmpty.length,
      sample: Array.from(unique).slice(0, 5),
    }
  })
}

/** Detect data quality issues client-side */
export function detectDataQuality(data: Record<string, string>[], cols: ColumnMeta[]): DataQualityIssue[] {
  const issues: DataQualityIssue[] = []

  cols.forEach(col => {
    const pct = col.missingCount / data.length
    if (pct > 0.3) issues.push({ issue: `"${col.name}" has ${Math.round(pct * 100)}% missing values`, severity: 'high' })
    else if (pct > 0.05) issues.push({ issue: `"${col.name}" has ${col.missingCount} missing values`, severity: 'medium' })
  })

  // Duplicate rows
  const seen = new Set<string>()
  let dupes = 0
  data.forEach(row => {
    const key = JSON.stringify(row)
    if (seen.has(key)) dupes++
    else seen.add(key)
  })
  if (dupes > 0) issues.push({ issue: `${dupes} duplicate row${dupes > 1 ? 's' : ''} detected`, severity: dupes > 5 ? 'high' : 'low' })

  return issues
}

/** Build CSV string from data rows, capped at maxRows */
export function buildCsvString(data: Record<string, string>[], maxRows = 200): string {
  const rows = data.slice(0, maxRows)
  return [
    Object.keys(rows[0]).join(','),
    ...rows.map(row => Object.values(row).join(',')),
  ].join('\n')
}

/** Format a number nicely */
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toLocaleString()
}

/** Encode conversation + data as a shareable URL fragment */
export function encodeSharePayload(messages: object[], filename: string): string {
  const payload = { messages, filename, v: 2 }
  return btoa(encodeURIComponent(JSON.stringify(payload)))
}

export function decodeSharePayload(hash: string): { messages: object[]; filename: string } | null {
  try {
    return JSON.parse(decodeURIComponent(atob(hash)))
  } catch {
    return null
  }
}