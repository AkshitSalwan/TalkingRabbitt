'use client'

export default function KeyboardHints() {
  const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform)
  const mod = isMac ? '⌘' : 'Ctrl'

  const hints = [
    { keys: `${mod}+K`,        label: 'Focus input' },
    { keys: `${mod}+E`,        label: 'Upload CSV' },
    { keys: `${mod}+⇧+X`,     label: 'Clear chat' },
    { keys: 'Enter',           label: 'Send' },
    { keys: '⇧+Enter',        label: 'New line' },
  ]

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
      {hints.map(({ keys, label }) => (
        <div key={keys} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <kbd style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, background: '#EDE8DC',
            border: '1px solid rgba(181,112,58,0.2)', borderRadius: 3,
            padding: '1px 5px', color: '#B5703A',
          }}>{keys}</kbd>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#2D2D2D', opacity: 0.4 }}>{label}</span>
        </div>
      ))}
    </div>
  )
}
