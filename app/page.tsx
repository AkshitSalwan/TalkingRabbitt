'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import CSVUpload from './components/CSVUpload'
import ChatMessage, { type Message } from './components/ChatMessage'
import LoadingIndicator from './components/LoadingIndicator'
import SuggestedQuestions from './components/SuggestedQuestions'
import DataPreview from './components/DataPreview'
import AutoSummaryCard from './components/AutoSummaryCard'
import SqlMode from './components/SqlMode'
import ColumnSelector from './components/ColumnSelector'
import ExportReport from './components/ExportReport'
import ShareLink from './components/ShareLink'
import KeyboardHints from './components/KeyboardHints'
import { useSessionPersistence } from './hooks/useSessionPersistence'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { analyzeColumns } from './lib/dataUtils'

type InputMode = 'chat' | 'sql' | 'forecast'

export default function Home() {
  const [csvData,        setCsvData]        = useState<Record<string, string>[]>([])
  const [filename,       setFilename]       = useState('')
  const [messages,       setMessages]       = useState<Message[]>([])
  const [query,          setQuery]          = useState('')
  const [isLoading,      setIsLoading]      = useState(false)
  const [sidebarOpen,    setSidebarOpen]    = useState(true)
  const [inputMode,      setInputMode]      = useState<InputMode>('chat')
  const [showSummary,    setShowSummary]    = useState(false)
  const [showHints,      setShowHints]      = useState(false)
  const [selectedCols,   setSelectedCols]   = useState<string[]>([])
  const [sessionBanner,  setSessionBanner]  = useState<string | null>(null)

  const chatEndRef   = useRef<HTMLDivElement>(null)
  const textareaRef  = useRef<HTMLTextAreaElement>(null)
  const fileUploadRef = useRef<(() => void) | null>(null)

  const columns = useMemo(() => analyzeColumns(csvData), [csvData])

  const { loadSession, clearSession } = useSessionPersistence(messages, filename)

  // Load saved session on mount
  useEffect(() => {
    const saved = loadSession()
    if (saved?.messages?.length) {
      setMessages(saved.messages)
      setFilename(saved.filename ?? '')
      setSessionBanner(`Restored session: "${saved.filename}" with ${saved.messages.filter(m => m.role === 'user').length} queries`)
      setTimeout(() => setSessionBanner(null), 4000)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, isLoading, scrollToBottom])

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onFocusInput: () => textareaRef.current?.focus(),
    onUploadFile: () => fileUploadRef.current?.(),
    onClearChat:  () => { setMessages([]); clearSession() },
  })

  const handleDataLoaded = useCallback((data: Record<string, string>[], name: string) => {
    setCsvData(data)
    setFilename(name)
    setMessages([])
    setSelectedCols(Object.keys(data[0] ?? {}))
    setShowSummary(true)
    clearSession()
  }, [clearSession])

  // Build filtered CSV string from selected columns
  const buildFilteredCsv = useCallback((data: Record<string, string>[], cols: string[]) => {
    const rows = data.slice(0, 200)
    const headers = cols.length ? cols : Object.keys(rows[0])
    return [
      headers.join(','),
      ...rows.map(row => headers.map(c => row[c] ?? '').join(',')),
    ].join('\n')
  }, [])

  // Build conversation context (last 3 exchanges)
  const getContext = useCallback(() => {
    const recent = messages.slice(-6).filter(m => m.role === 'user' || m.role === 'assistant')
    return recent.map(m => `${m.role === 'user' ? 'User' : 'Rabbitt'}: ${m.content}`).join('\n')
  }, [messages])

  const handleSubmit = async (overrideQuery?: string) => {
    const q = (overrideQuery ?? query).trim()
    if (!q || !csvData.length) return

    const isForecast = inputMode === 'forecast'

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: isForecast ? `📈 Forecast: ${q}` : q,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setQuery('')
    setIsLoading(true)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const endpoint = isForecast ? '/api/forecast' : '/api/analyze'
    const body = isForecast
      ? { query: q, data: csvData }
      : { query: q, data: csvData, context: getContext() }

    try {
      const res  = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`)

      if (isForecast) {
        setMessages(prev => [...prev, {
          id:             (Date.now() + 1).toString(),
          role:           'assistant',
          content:        json.answer,
          chartType:      'forecast',
          labels:         json.labels,
          values:         json.historicalValues,
          forecastValues: json.forecastValues,
          forecastStart:  json.forecastStart,
          timestamp:      new Date(),
        }])
      } else {
        setMessages(prev => [...prev, {
          id:        (Date.now() + 1).toString(),
          role:      'assistant',
          content:   json.answer,
          chartType: json.chartType,
          labels:    json.labels,
          values:    json.values,
          timestamp: new Date(),
        }])
      }
    } catch (err: unknown) {
      setMessages(prev => [...prev, {
        id:        (Date.now() + 1).toString(),
        role:      'error',
        content:   err instanceof Error ? err.message : 'An unexpected error occurred.',
        timestamp: new Date(),
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const clearChat = () => { setMessages([]); clearSession() }

  const hasData = csvData.length > 0

  const modeTabs: { key: InputMode; label: string; title: string }[] = [
    { key: 'chat',     label: 'Chat',     title: 'Ask natural language questions' },
    { key: 'forecast', label: 'Forecast', title: 'Predict future trends' },
    { key: 'sql',      label: 'SQL',      title: 'Write SQL queries directly' },
  ]

  /* ─────────────────────────────────────────── render */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* ══ SESSION BANNER ══════════════════════════════════════ */}
      {sessionBanner && (
        <div style={{
          background: '#7A8C6E', color: '#F5F0E8', padding: '6px 20px',
          fontSize: 11, fontFamily: 'var(--font-mono)', textAlign: 'center',
          animation: 'fadeIn 0.3s ease',
        }}>
          ✓ {sessionBanner}
        </div>
      )}

      {/* ══ HEADER ══════════════════════════════════════════════ */}
      <header style={{
        flexShrink: 0, borderBottom: '1px solid rgba(181,112,58,0.15)',
        background: 'rgba(245,240,232,0.9)', backdropFilter: 'blur(6px)',
        padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#B5703A' }}
            title="Toggle sidebar"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
          <span style={{ fontSize: 22 }}>🐇</span>
          <div>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: '#1A1209', lineHeight: 1 }}>
              Talking Rabbitt
            </h1>
            <p style={{ margin: '2px 0 0', fontFamily: 'var(--font-mono)', fontSize: 9, color: '#B5703A', textTransform: 'uppercase', letterSpacing: '0.15em', lineHeight: 1 }}>
              Conversational Business Analytics
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {hasData && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontFamily: 'var(--font-mono)', color: '#7A8C6E', border: '1px solid rgba(122,140,110,0.3)', borderRadius: 999, padding: '3px 9px' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#7A8C6E', display: 'inline-block' }} />
              {csvData.length.toLocaleString()} rows
            </span>
          )}
          {hasData && <ExportReport messages={messages} filename={filename} />}
          {hasData && <ShareLink messages={messages} filename={filename} />}
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              title="Clear chat (⌘⇧X)"
              style={{ background: 'none', border: '1px solid rgba(181,112,58,0.2)', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 10, fontFamily: 'var(--font-mono)', color: '#2D2D2D', opacity: 0.45 }}
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setShowHints(h => !h)}
            title="Keyboard shortcuts"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, opacity: 0.4, padding: '2px 4px' }}
          >
            ⌨
          </button>
        </div>
      </header>

      {/* Keyboard hints dropdown */}
      {showHints && (
        <div style={{ background: '#EDE8DC', borderBottom: '1px solid rgba(181,112,58,0.15)', padding: '8px 20px' }}>
          <KeyboardHints />
        </div>
      )}

      {/* ══ BODY ════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

        {/* ── SIDEBAR ──────────────────────────────────────────── */}
        <aside style={{
          width: sidebarOpen ? 272 : 0,
          flexShrink: 0,
          background: '#F5F0E8',
          borderRight: '1px solid rgba(181,112,58,0.15)',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto', overflowX: 'hidden',
          transition: 'width 0.25s ease',
        }}>
          <div style={{ width: 272, padding: 16, flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* 01 Data Source */}
            <div>
              <p style={{ margin: '0 0 10px', fontSize: 10, fontFamily: 'var(--font-mono)', color: '#2D2D2D', opacity: 0.38, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                01 / Data Source
              </p>
              <CSVUpload
                onDataLoaded={handleDataLoaded}
                hasData={hasData}
                filename={filename}
                rowCount={csvData.length}
                onFilePickerRef={(fn) => { fileUploadRef.current = fn }}
              />
            </div>

            {hasData && <div className="ink-line" />}

            {/* 02 Preview */}
            {hasData && (
              <div>
                <p style={{ margin: '0 0 10px', fontSize: 10, fontFamily: 'var(--font-mono)', color: '#2D2D2D', opacity: 0.38, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                  02 / Preview
                </p>
                <DataPreview data={csvData} />
              </div>
            )}

            {/* 03 Session stats */}
            {hasData && (
              <div>
                <div className="ink-line" style={{ marginBottom: 14 }} />
                <p style={{ margin: '0 0 10px', fontSize: 10, fontFamily: 'var(--font-mono)', color: '#2D2D2D', opacity: 0.38, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                  03 / Session
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { label: 'Queries', val: messages.filter(m => m.role === 'user').length },
                    { label: 'Charts',  val: messages.filter(m => m.role === 'assistant' && m.labels?.length).length },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ background: '#EDE8DC', borderRadius: 4, padding: '8px 10px' }}>
                      <p style={{ margin: '0 0 1px', fontSize: 10, fontFamily: 'var(--font-mono)', color: '#2D2D2D', opacity: 0.38, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</p>
                      <p style={{ margin: 0, fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 600, color: '#1A1209' }}>{val}</p>
                    </div>
                  ))}
                </div>

                {/* Re-run auto analysis */}
                <button
                  onClick={() => setShowSummary(true)}
                  style={{ marginTop: 8, width: '100%', background: 'none', border: '1px solid rgba(181,112,58,0.2)', borderRadius: 4, padding: '5px 0', cursor: 'pointer', fontSize: 10, fontFamily: 'var(--font-mono)', color: '#B5703A', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                >
                  Re-run Analysis
                </button>
              </div>
            )}
          </div>

          <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(181,112,58,0.1)', width: 272 }}>
            <p style={{ margin: 0, fontSize: 10, fontFamily: 'var(--font-mono)', color: '#2D2D2D', opacity: 0.22, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              Powered by Gemini 2.5 Flash
            </p>
          </div>
        </aside>

        {/* ── MAIN PANEL ───────────────────────────────────────── */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>

          {/* Mode tabs (visible when data loaded) */}
          {hasData && (
            <div style={{ flexShrink: 0, borderBottom: '1px solid rgba(181,112,58,0.12)', background: '#F5F0E8', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 0 }}>
              {modeTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setInputMode(tab.key)}
                  title={tab.title}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '9px 14px', fontSize: 11, fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    color: inputMode === tab.key ? '#B5703A' : '#2D2D2D',
                    opacity: inputMode === tab.key ? 1 : 0.38,
                    borderBottom: inputMode === tab.key ? '2px solid #B5703A' : '2px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  {tab.label}
                </button>
              ))}
              <div style={{ flex: 1 }} />
              {/* Column selector (chat + forecast mode) */}
              {inputMode !== 'sql' && columns.length > 0 && (
                <ColumnSelector
                  columns={columns}
                  selected={selectedCols}
                  onChange={setSelectedCols}
                />
              )}
            </div>
          )}

          {/* Chat scroll area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

            {/* Empty — no data */}
            {!hasData && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', userSelect: 'none' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 72, color: 'rgba(181,112,58,0.15)', lineHeight: 1, marginBottom: 8 }}>R</p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400, color: 'rgba(26,18,9,0.65)', margin: '0 0 10px' }}>
                  Ask your data anything
                </h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#2D2D2D', opacity: 0.38, maxWidth: 340, lineHeight: 1.65, margin: 0 }}>
                  Upload a CSV to begin. Ask in plain English, write SQL, or forecast trends — Rabbitt handles it all.
                </p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#2D2D2D', opacity: 0.22, textTransform: 'uppercase', letterSpacing: '0.14em', marginTop: 28 }}>
                  ← Upload a CSV to start
                </p>
              </div>
            )}

            {/* SQL mode */}
            {hasData && inputMode === 'sql' && (
              <div style={{ maxWidth: 760, margin: '0 auto' }}>
                <SqlMode data={csvData} />
              </div>
            )}

            {/* Chat / Forecast mode content */}
            {hasData && inputMode !== 'sql' && (
              <div style={{ maxWidth: 760, margin: '0 auto' }}>

                {/* Auto summary */}
                {showSummary && (
                  <AutoSummaryCard
                    data={csvData}
                    onDismiss={() => setShowSummary(false)}
                  />
                )}

                {/* Empty chat state */}
                {messages.length === 0 && !isLoading && !showSummary && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, textAlign: 'center' }}>
                    <span style={{ fontSize: 36, marginBottom: 10 }}>🐇</span>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 400, color: '#1A1209', margin: '0 0 6px' }}>Ready to analyze</h2>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#2D2D2D', opacity: 0.38, maxWidth: 280, lineHeight: 1.6, margin: 0 }}>
                      {inputMode === 'forecast'
                        ? 'Ask a forecast question, e.g. "What will revenue look like next quarter?"'
                        : 'Ask a question below to get insights and charts.'}
                    </p>
                  </div>
                )}

                {/* Messages */}
                {messages.map(msg => (
                  <div key={msg.id} data-msg-id={msg.id}>
                    <ChatMessage message={msg} />
                  </div>
                ))}
                {isLoading && <LoadingIndicator />}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* ── INPUT AREA ─────────────────────────────────────── */}
          {inputMode !== 'sql' && (
            <div style={{
              flexShrink: 0, borderTop: '1px solid rgba(181,112,58,0.15)',
              background: 'rgba(245,240,232,0.92)', backdropFilter: 'blur(6px)',
              padding: '12px 20px',
            }}>
              <div style={{ maxWidth: 760, margin: '0 auto' }}>
                <SuggestedQuestions hasData={hasData} onSelect={(q) => handleSubmit(q)} />

                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <textarea
                    ref={textareaRef}
                    value={query}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    disabled={!hasData || isLoading}
                    placeholder={
                      !hasData ? 'Upload a CSV file first…'
                      : inputMode === 'forecast' ? 'e.g. "What will North region revenue look like next quarter?"'
                      : 'Ask a question about your data…'
                    }
                    className="chat-input"
                    style={{ flex: 1, borderRadius: 4, padding: '11px 14px', minHeight: 46, lineHeight: 1.5 }}
                  />
                  <button
                    onClick={() => handleSubmit()}
                    disabled={!hasData || !query.trim() || isLoading}
                    className="btn-primary"
                    style={{ height: 46, borderRadius: 4, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}
                  >
                    {isLoading ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ animation: 'spin 0.9s linear infinite' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    )}
                    <span>{isLoading ? 'Thinking' : inputMode === 'forecast' ? 'Forecast' : 'Ask'}</span>
                  </button>
                </div>

                <p style={{ textAlign: 'center', fontSize: 10, fontFamily: 'var(--font-mono)', color: '#2D2D2D', opacity: 0.18, marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Enter · Shift+Enter for new line · ⌘K focus · ⌘E upload
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
