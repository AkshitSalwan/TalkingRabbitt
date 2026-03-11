'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Papa from 'papaparse'

interface Props {
  onDataLoaded: (data: Record<string, string>[], filename: string) => void
  hasData: boolean
  filename: string
  rowCount: number
  onFilePickerRef?: (fn: () => void) => void
}

export default function CSVUpload({ onDataLoaded, hasData, filename, rowCount, onFilePickerRef }: Props) {
  const [isDragging,    setIsDragging]    = useState(false)
  const [error,         setError]         = useState<string | null>(null)
  const [isProcessing,  setIsProcessing]  = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (onFilePickerRef) onFilePickerRef(() => fileRef.current?.click())
  }, [onFilePickerRef])

  const processFile = useCallback((file: File) => {
    setError(null)
    setIsProcessing(true)

    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      setError('Please upload a .csv file.')
      setIsProcessing(false)
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5 MB.')
      setIsProcessing(false)
      return
    }

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length === 0) {
          setError('The CSV file appears to be empty.')
          setIsProcessing(false)
          return
        }
        if (Object.keys(results.data[0] ?? {}).length < 2) {
          setError('CSV must have at least 2 columns.')
          setIsProcessing(false)
          return
        }
        onDataLoaded(results.data, file.name)
        setIsProcessing(false)
      },
      error: () => {
        setError('Failed to read the file. Please try again.')
        setIsProcessing(false)
      },
    })
  }, [onDataLoaded])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {/* Drop zone */}
      <div
        className={`upload-zone${isDragging ? ' drag-over' : ''}`}
        style={{ borderRadius:4, padding:'24px 16px', textAlign:'center' }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleChange} style={{ display:'none' }} />

        {isProcessing ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
            <div style={{ display:'flex', gap:4 }}>
              <span className="dot" /><span className="dot" /><span className="dot" />
            </div>
            <p style={{ margin:0, fontSize:11, fontFamily:'var(--font-mono)', color:'#B5703A',
              textTransform:'uppercase', letterSpacing:'0.1em' }}>Parsing…</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#B5703A" strokeOpacity={0.6}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <p style={{ margin:0, fontSize:11, fontFamily:'var(--font-mono)', textTransform:'uppercase',
                letterSpacing:'0.12em', color:'#2D2D2D' }}>Drop CSV here</p>
              <p style={{ margin:'3px 0 0', fontSize:11, fontFamily:'var(--font-body)', color:'#2D2D2D', opacity:0.45 }}>
                or click to browse
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:4, padding:'8px 12px' }}>
          <p style={{ margin:0, fontSize:11, fontFamily:'var(--font-mono)', color:'#DC2626' }}>{error}</p>
        </div>
      )}

      {/* Loaded state */}
      {hasData && (
        <div className="animate-fade-in">
          <div className="ink-line" style={{ marginBottom:10 }} />
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ margin:'0 0 2px', fontSize:10, fontFamily:'var(--font-mono)', color:'#B5703A',
                textTransform:'uppercase', letterSpacing:'0.12em' }}>Loaded</p>
              <p style={{ margin:0, fontSize:13, fontFamily:'var(--font-body)', color:'#1A1209',
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={filename}>
                {filename}
              </p>
            </div>
            <div style={{ textAlign:'right', flexShrink:0 }}>
              <p style={{ margin:'0 0 1px', fontSize:10, fontFamily:'var(--font-mono)', color:'#2D2D2D',
                opacity:0.4, textTransform:'uppercase', letterSpacing:'0.1em' }}>Rows</p>
              <p style={{ margin:0, fontSize:20, fontFamily:'var(--font-display)', fontWeight:600, color:'#1A1209' }}>
                {rowCount.toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); fileRef.current?.click() }}
            style={{ marginTop:8, width:'100%', background:'none', border:'none', cursor:'pointer',
              fontSize:11, fontFamily:'var(--font-mono)', color:'#2D2D2D', opacity:0.35,
              textTransform:'uppercase', letterSpacing:'0.12em', padding:'4px 0' }}
          >
            Replace file
          </button>
        </div>
      )}

      {/* Schema hint */}
      {!hasData && (
        <div>
          <p style={{ margin:'0 0 6px', fontSize:10, fontFamily:'var(--font-mono)', color:'#2D2D2D',
            opacity:0.38, textTransform:'uppercase', letterSpacing:'0.12em' }}>
            Example schema
          </p>
          <div style={{ background:'#EDE8DC', borderRadius:4, padding:'8px 10px',
            fontFamily:'var(--font-mono)', fontSize:11, color:'#2D2D2D', opacity:0.6,
            lineHeight:1.7 }}>
            <div>region, month, revenue</div>
            <div style={{ opacity:0.65 }}>North, Jan, 12000</div>
            <div style={{ opacity:0.65 }}>South, Feb, 9500</div>
          </div>
        </div>
      )}
    </div>
  )
}
