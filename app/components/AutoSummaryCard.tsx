'use client'

import { useState, useEffect } from 'react'
import { type AutoSummary } from '../lib/aiService'
import { type DataQualityIssue, analyzeColumns, detectDataQuality } from '../lib/dataUtils'

interface Props {
  data: Record<string, string>[]
  onDismiss: () => void
}

const severityColor: Record<string, string> = {
  high:   '#C4542A',
  medium: '#B5703A',
  low:    '#7A8C6E',
}

export default function AutoSummaryCard({ data, onDismiss }: Props) {
  const [summary,   setSummary]   = useState<AutoSummary | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [clientIssues] = useState<DataQualityIssue[]>(() => {
    const cols = analyzeColumns(data)
    return detectDataQuality(data, cols)
  })

  useEffect(() => {
    const run = async () => {
      try {
        const res  = await fetch('/api/auto-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        setSummary(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate summary')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [data])

  const allQuality = [
    ...(summary?.dataQuality ?? []),
    ...clientIssues,
  ]

  return (
    <div className="animate-fade-in" style={{
      background: 'linear-gradient(135deg, rgba(181,112,58,0.06), rgba(122,140,110,0.06))',
      border: '1px solid rgba(181,112,58,0.2)', borderRadius: 6,
      padding: 16, marginBottom: 20,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>🐇</span>
          <p style={{ margin: 0, fontSize: 11, fontFamily: 'var(--font-mono)', color: '#B5703A', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Auto-Analysis
          </p>
        </div>
        <button
          onClick={onDismiss}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#2D2D2D', opacity: 0.35, lineHeight: 1 }}
        >
          ×
        </button>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="dot" /><span className="dot" /><span className="dot" />
          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#2D2D2D', opacity: 0.4 }}>Analyzing dataset…</span>
        </div>
      )}

      {error && (
        <p style={{ margin: 0, fontSize: 12, color: '#C4542A', fontFamily: 'var(--font-mono)' }}>{error}</p>
      )}

      {!loading && summary && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Stats row */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { label: 'Rows',    value: summary.rowCount.toLocaleString() },
              { label: 'Columns', value: summary.columnCount },
              { label: 'Numeric', value: summary.columns.filter(c => c.type === 'numeric').length },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'white', border: '1px solid rgba(181,112,58,0.15)', borderRadius: 4, padding: '6px 12px', textAlign: 'center', minWidth: 64 }}>
                <p style={{ margin: '0 0 1px', fontSize: 10, fontFamily: 'var(--font-mono)', color: '#2D2D2D', opacity: 0.4, textTransform: 'uppercase' }}>{label}</p>
                <p style={{ margin: 0, fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 600, color: '#1A1209' }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Insights */}
          <div>
            <p style={{ margin: '0 0 6px', fontSize: 10, fontFamily: 'var(--font-mono)', color: '#B5703A', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Key Insights
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {summary.insights.map((insight, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: '#B5703A', fontSize: 12, marginTop: 1, flexShrink: 0 }}>→</span>
                  <p style={{ margin: 0, fontSize: 13, fontFamily: 'var(--font-body)', color: '#1A1209', lineHeight: 1.5 }}>{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Anomalies */}
          {summary.anomalies?.length > 0 && (
            <div>
              <p style={{ margin: '0 0 6px', fontSize: 10, fontFamily: 'var(--font-mono)', color: '#C4542A', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Anomalies Detected
              </p>
              {summary.anomalies.map((a, i) => (
                <p key={i} style={{ margin: '0 0 3px', fontSize: 12, fontFamily: 'var(--font-body)', color: '#7A1209' }}>⚠ {a}</p>
              ))}
            </div>
          )}

          {/* Data quality */}
          {allQuality.length > 0 && (
            <div>
              <p style={{ margin: '0 0 6px', fontSize: 10, fontFamily: 'var(--font-mono)', color: '#7A8C6E', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Data Quality
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {allQuality.map((q, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: severityColor[q.severity], flexShrink: 0, display: 'inline-block' }} />
                    <p style={{ margin: 0, fontSize: 12, fontFamily: 'var(--font-body)', color: '#1A1209' }}>{q.issue}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Column chips */}
          <div>
            <p style={{ margin: '0 0 6px', fontSize: 10, fontFamily: 'var(--font-mono)', color: '#2D2D2D', opacity: 0.38, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Columns
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {summary.columns.map(col => (
                <span key={col.name} style={{
                  fontSize: 11, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 999,
                  background: col.type === 'numeric' ? 'rgba(181,112,58,0.12)' : col.type === 'date' ? 'rgba(122,140,110,0.12)' : 'rgba(45,45,45,0.07)',
                  color: col.type === 'numeric' ? '#B5703A' : col.type === 'date' ? '#7A8C6E' : '#2D2D2D',
                  border: `1px solid ${col.type === 'numeric' ? 'rgba(181,112,58,0.2)' : col.type === 'date' ? 'rgba(122,140,110,0.2)' : 'rgba(45,45,45,0.12)'}`,
                }}>
                  {col.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
