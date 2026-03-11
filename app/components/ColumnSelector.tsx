'use client'

import { useState } from 'react'
import { type ColumnMeta } from '../lib/dataUtils'

interface Props {
  columns: ColumnMeta[]
  selected: string[]
  onChange: (cols: string[]) => void
}

const typeColor: Record<string, string> = {
  numeric:     '#B5703A',
  categorical: '#2D2D2D',
  date:        '#7A8C6E',
}

export default function ColumnSelector({ columns, selected, onChange }: Props) {
  const [open, setOpen] = useState(false)

  const toggle = (name: string) => {
    if (selected.includes(name)) {
      if (selected.length === 1) return // keep at least one
      onChange(selected.filter(c => c !== name))
    } else {
      onChange([...selected, name])
    }
  }

  const selectAll  = () => onChange(columns.map(c => c.name))
  const selectNone = () => onChange(columns.slice(0, 1).map(c => c.name))

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none', border: '1px solid rgba(181,112,58,0.25)', borderRadius: 4,
          padding: '4px 10px', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono)',
          color: '#B5703A', display: 'flex', alignItems: 'center', gap: 5,
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}
      >
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        Columns ({selected.length}/{columns.length})
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 50,
            background: '#F5F0E8', border: '1px solid rgba(181,112,58,0.2)', borderRadius: 6,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 220, padding: 10,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <button onClick={selectAll}  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, fontFamily: 'var(--font-mono)', color: '#B5703A', textTransform: 'uppercase' }}>All</button>
              <button onClick={selectNone} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, fontFamily: 'var(--font-mono)', color: '#2D2D2D', opacity: 0.4, textTransform: 'uppercase' }}>None</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {columns.map(col => (
                <label key={col.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', cursor: 'pointer', borderRadius: 3, background: selected.includes(col.name) ? 'rgba(181,112,58,0.08)' : 'transparent' }}>
                  <input
                    type="checkbox"
                    checked={selected.includes(col.name)}
                    onChange={() => toggle(col.name)}
                    style={{ accentColor: '#B5703A' }}
                  />
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#1A1209', flex: 1 }}>{col.name}</span>
                  <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: typeColor[col.type], textTransform: 'uppercase', letterSpacing: '0.08em' }}>{col.type}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
