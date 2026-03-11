'use client'

import { useState } from 'react'

interface Props { data: Record<string, string>[] }

export default function DataPreview({ data }: Props) {
  const [expanded, setExpanded] = useState(false)
  if (!data.length) return null

  const cols    = Object.keys(data[0])
  const showing = expanded ? 10 : 4
  const rows    = data.slice(0, showing)

  return (
    <div>
      {/* Header row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <p style={{ margin:0, fontSize:10, fontFamily:'var(--font-mono)', color:'#B5703A',
          textTransform:'uppercase', letterSpacing:'0.12em' }}>Dataset Preview</p>
        <button
          onClick={() => setExpanded(e => !e)}
          style={{ background:'none', border:'none', cursor:'pointer', fontSize:11,
            fontFamily:'var(--font-mono)', color:'#2D2D2D', opacity:0.4 }}
        >
          {expanded ? 'Less ↑' : 'More ↓'}
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
          <thead>
            <tr style={{ borderBottom:'1px solid rgba(181,112,58,0.2)' }}>
              {cols.map(col => (
                <th key={col} style={{ textAlign:'left', padding:'4px 8px', fontFamily:'var(--font-mono)',
                  color:'#B5703A', textTransform:'uppercase', letterSpacing:'0.1em',
                  whiteSpace:'nowrap', fontWeight:500 }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 1 ? 'rgba(237,232,220,0.45)' : 'transparent',
                borderBottom:'1px solid rgba(181,112,58,0.06)' }}>
                {cols.map(col => (
                  <td key={col} style={{ padding:'4px 8px', fontFamily:'var(--font-body)',
                    color:'rgba(26,18,9,0.65)', whiteSpace:'nowrap' }}>
                    {row[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length > showing && (
        <p style={{ margin:'6px 0 0', fontSize:11, fontFamily:'var(--font-mono)', color:'#2D2D2D',
          opacity:0.28, textAlign:'center' }}>
          +{data.length - showing} more rows
        </p>
      )}
    </div>
  )
}
