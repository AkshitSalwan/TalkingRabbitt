'use client'

import { useState, useRef } from 'react'

interface Props {
  data: Record<string, string>[]
  tableName?: string
}

interface QueryResult {
  columns: string[]
  rows: Record<string, unknown>[]
  rowCount: number
  durationMs: number
}

export default function SqlMode({ data, tableName = 'data' }: Props) {
  const [sql,     setSql]     = useState(`SELECT region, SUM(CAST(revenue AS NUMBER)) as total\nFROM data\nGROUP BY region\nORDER BY total DESC`)
  const [result,  setResult]  = useState<QueryResult | null>(null)
  const [error,   setError]   = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const runQuery = async () => {
    if (!sql.trim()) return
    setRunning(true)
    setError(null)
    setResult(null)

    // Validate server-side first
    try {
      const validation = await fetch('/api/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sql }),
      })
      const validJson = await validation.json()
      if (!validation.ok) { setError(validJson.error); setRunning(false); return }
    } catch {
      setError('Failed to validate query')
      setRunning(false)
      return
    }

    // Execute client-side with alasql
    try {
      // Dynamic import to avoid SSR issues
      const alasql = (await import('alasql')).default
      const start = performance.now()

      // Register the table
      alasql.tables = {}
      alasql(`CREATE TABLE ${tableName}`)
      alasql.tables[tableName].data = data

      const rows = alasql(sql) as Record<string, unknown>[]
      const duration = Math.round(performance.now() - start)

      if (!rows || rows.length === 0) {
        setResult({ columns: [], rows: [], rowCount: 0, durationMs: duration })
      } else {
        setResult({
          columns: Object.keys(rows[0]),
          rows: rows.slice(0, 200),
          rowCount: rows.length,
          durationMs: duration,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query execution failed')
    } finally {
      setRunning(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      runQuery()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Editor */}
      <div style={{ position: 'relative' }}>
        <textarea
          ref={textareaRef}
          value={sql}
          onChange={e => setSql(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={5}
          spellCheck={false}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: '#1A1209', color: '#F5F0E8',
            border: '1px solid rgba(181,112,58,0.3)', borderRadius: 4,
            padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 12,
            lineHeight: 1.6, resize: 'vertical', outline: 'none',
          }}
          placeholder={`SELECT * FROM ${tableName} LIMIT 10`}
        />
        <div style={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#F5F0E8', opacity: 0.25 }}>⌘+Enter to run</span>
          <button
            onClick={runQuery}
            disabled={running || !sql.trim()}
            className="btn-primary"
            style={{ borderRadius: 3, padding: '4px 10px', fontSize: 10 }}
          >
            {running ? 'Running…' : 'Run ▶'}
          </button>
        </div>
      </div>

      {/* Table hint */}
      <p style={{ margin: 0, fontSize: 10, fontFamily: 'var(--font-mono)', color: '#2D2D2D', opacity: 0.38 }}>
        Table name: <strong style={{ color: '#B5703A' }}>{tableName}</strong> · Only SELECT queries allowed
      </p>

      {/* Error */}
      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 4, padding: '8px 12px' }}>
          <p style={{ margin: 0, fontSize: 11, fontFamily: 'var(--font-mono)', color: '#DC2626' }}>{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <p style={{ margin: 0, fontSize: 10, fontFamily: 'var(--font-mono)', color: '#7A8C6E', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {result.rowCount} row{result.rowCount !== 1 ? 's' : ''} · {result.durationMs}ms
            </p>
          </div>

          {result.columns.length > 0 ? (
            <div style={{ overflowX: 'auto', border: '1px solid rgba(181,112,58,0.15)', borderRadius: 4 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ background: '#EDE8DC', borderBottom: '1px solid rgba(181,112,58,0.2)' }}>
                    {result.columns.map(col => (
                      <th key={col} style={{ textAlign: 'left', padding: '5px 10px', fontFamily: 'var(--font-mono)', color: '#B5703A', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(181,112,58,0.07)', background: i % 2 === 1 ? 'rgba(237,232,220,0.4)' : 'transparent' }}>
                      {result.columns.map(col => (
                        <td key={col} style={{ padding: '5px 10px', fontFamily: 'var(--font-mono)', color: '#1A1209', whiteSpace: 'nowrap' }}>
                          {String(row[col] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: '#2D2D2D', opacity: 0.4 }}>No results returned.</p>
          )}
        </div>
      )}
    </div>
  )
}
