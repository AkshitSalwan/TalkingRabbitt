'use client'

import { useState } from 'react'
import { type Message } from './ChatMessage'
import { encodeSharePayload } from '../lib/dataUtils'

interface Props { messages: Message[]; filename: string }

export default function ShareLink({ messages, filename }: Props) {
  const [copied, setCopied] = useState(false)

  const shareable = messages.filter(m => m.role === 'user' || m.role === 'assistant')
  if (!shareable.length) return null

  const share = async () => {
    const hash = encodeSharePayload(shareable, filename)
    const url  = `${window.location.origin}${window.location.pathname}#share=${hash}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      prompt('Copy this link:', url)
    }
  }

  return (
    <button
      onClick={share}
      style={{
        background: 'none', border: '1px solid rgba(181,112,58,0.25)', borderRadius: 4,
        padding: '4px 10px', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono)',
        color: copied ? '#7A8C6E' : '#B5703A', display: 'flex', alignItems: 'center', gap: 5,
        textTransform: 'uppercase', letterSpacing: '0.08em', transition: 'color 0.2s',
      }}
    >
      {copied ? (
        <>✓ Link Copied</>
      ) : (
        <>
          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </>
      )}
    </button>
  )
}
