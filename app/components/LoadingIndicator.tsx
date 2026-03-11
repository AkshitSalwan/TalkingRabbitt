'use client'

export default function LoadingIndicator() {
  return (
    <div className="message-enter flex gap-2 mb-4">
      {/* Avatar */}
      <div
        style={{ width: 28, height: 28, borderRadius: '50%', background: '#B5703A',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
      >
        <span style={{ fontSize: 14 }}>🐇</span>
      </div>

      {/* Bubble */}
      <div className="ai-bubble rounded rounded-bl-sm px-4 py-3 flex items-center gap-2">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#2D2D2D', opacity: 0.4, marginLeft: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Analyzing…
        </span>
      </div>
    </div>
  )
}
