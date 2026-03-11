'use client'

import { useState, useRef } from 'react'
import ChartDisplay from './ChartDisplay'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'error' | 'system'
  content: string
  chartType?: 'bar' | 'line' | 'forecast'
  labels?: string[]
  values?: number[]
  forecastValues?: (number | null)[]
  forecastStart?: number
  timestamp: Date
}

interface Props { message: Message }

export default function ChatMessage({ message }: Props) {
  const [copied, setCopied] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)
  const time = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const hasChart = message.role === 'assistant' && message.chartType && message.labels?.length && message.values?.length

  const copyInsight = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const downloadChart = () => {
    const canvas = chartRef.current?.querySelector('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `rabbitt-chart-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  /* ── System message (auto-summary header etc.) ── */
  if (message.role === 'system') {
    return (
      <div className="message-enter" style={{ marginBottom: 16 }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(181,112,58,0.07), rgba(122,140,110,0.07))',
          border: '1px solid rgba(181,112,58,0.18)', borderRadius: 6, padding: '12px 16px',
        }}>
          <p style={{ margin: 0, fontSize: 13, fontFamily: 'var(--font-body)', color: '#1A1209', lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ __html: message.content }} />
        </div>
      </div>
    )
  }

  /* ── User ── */
  if (message.role === 'user') {
    return (
      <div className="message-enter" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16 }}>
        <div style={{ maxWidth: '78%' }}>
          <div className="user-bubble" style={{ borderRadius: '8px 8px 2px 8px', padding: '10px 16px' }}>
            <p style={{ margin: 0, fontSize: 14, fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>{message.content}</p>
          </div>
          <p style={{ textAlign: 'right', fontSize: 11, fontFamily: 'var(--font-mono)', opacity: 0.3, marginTop: 3 }}>{time}</p>
        </div>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', background: '#2D2D2D',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
        }}>
          <span style={{ color: '#F5F0E8', fontSize: 11, fontFamily: 'var(--font-mono)' }}>U</span>
        </div>
      </div>
    )
  }

  /* ── Error ── */
  if (message.role === 'error') {
    return (
      <div className="message-enter" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', background: '#C4542A',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
        }}>
          <span style={{ color: '#F5F0E8', fontSize: 12 }}>!</span>
        </div>
        <div style={{ maxWidth: '85%' }}>
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA',
            borderLeft: '3px solid #C4542A', borderRadius: '2px 8px 8px 2px', padding: '10px 16px',
          }}>
            <p style={{ margin: '0 0 4px', fontSize: 10, fontFamily: 'var(--font-mono)', color: '#C4542A', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Error</p>
            <p style={{ margin: 0, fontSize: 13, fontFamily: 'var(--font-body)', color: '#991B1B', lineHeight: 1.5 }}>{message.content}</p>
          </div>
        </div>
      </div>
    )
  }

  /* ── Assistant ── */
  return (
    <div className="message-enter" style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', background: '#B5703A',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
      }}>
        <span style={{ fontSize: 14 }}>🐇</span>
      </div>

      <div style={{ maxWidth: '88%', flex: 1 }}>
        <div className="ai-bubble" style={{ borderRadius: '2px 8px 8px 2px', padding: '12px 16px' }}>
          {/* Answer text + copy button */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <p style={{ margin: 0, fontSize: 14, fontFamily: 'var(--font-body)', lineHeight: 1.65, color: '#1A1209', flex: 1 }}>
              {message.content}
            </p>
            <button
              onClick={copyInsight}
              title="Copy insight"
              style={{
                background: 'none', border: '1px solid rgba(181,112,58,0.2)', borderRadius: 4,
                padding: '3px 6px', cursor: 'pointer', fontSize: 10, fontFamily: 'var(--font-mono)',
                color: copied ? '#7A8C6E' : '#B5703A', flexShrink: 0, marginTop: 1,
                transition: 'all 0.2s',
              }}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>

          {/* Chart */}
          {hasChart && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(181,112,58,0.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#B5703A', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  {message.chartType === 'forecast' ? 'forecast chart' : `${message.chartType} chart`}
                </span>
                <div className="ink-line" style={{ flex: 1 }} />
                <button
                  onClick={downloadChart}
                  title="Download chart as PNG"
                  style={{
                    background: 'none', border: '1px solid rgba(181,112,58,0.2)', borderRadius: 4,
                    padding: '2px 7px', cursor: 'pointer', fontSize: 10, fontFamily: 'var(--font-mono)',
                    color: '#B5703A',
                  }}
                >
                  ↓ PNG
                </button>
              </div>
              <div ref={chartRef}>
                <ChartDisplay
                  chartType={message.chartType === 'forecast' ? 'line' : message.chartType!}
                  labels={message.labels!}
                  values={message.values!}
                  forecastValues={message.forecastValues}
                  forecastStart={message.forecastStart}
                />
              </div>
            </div>
          )}
        </div>
        <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', opacity: 0.28, marginTop: 3, paddingLeft: 2 }}>{time}</p>
      </div>
    </div>
  )
}
