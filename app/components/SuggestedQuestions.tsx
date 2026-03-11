'use client'

interface Props {
  hasData: boolean
  onSelect: (q: string) => void
}

const SUGGESTIONS = [
  'Which region had the highest revenue?',
  'Show revenue trend by month',
  'Which region performed best in Q1?',
  'What is the total revenue per region?',
  'Compare monthly performance across regions',
]

export default function SuggestedQuestions({ hasData, onSelect }: Props) {
  if (!hasData) return null

  return (
    <div style={{ marginBottom:12 }}>
      <p style={{ margin:'0 0 7px', fontSize:10, fontFamily:'var(--font-mono)', color:'#2D2D2D',
        opacity:0.38, textTransform:'uppercase', letterSpacing:'0.14em' }}>
        Try asking
      </p>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
        {SUGGESTIONS.map(q => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            style={{
              background:'#EDE8DC',
              border:'1px solid rgba(181,112,58,0.2)',
              borderRadius:999,
              padding:'5px 12px',
              fontSize:12,
              fontFamily:'var(--font-body)',
              color:'#1A1209',
              cursor:'pointer',
              transition:'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => {
              (e.target as HTMLButtonElement).style.borderColor = 'rgba(181,112,58,0.5)'
              ;(e.target as HTMLButtonElement).style.background  = 'rgba(181,112,58,0.07)'
            }}
            onMouseLeave={e => {
              (e.target as HTMLButtonElement).style.borderColor = 'rgba(181,112,58,0.2)'
              ;(e.target as HTMLButtonElement).style.background  = '#EDE8DC'
            }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
