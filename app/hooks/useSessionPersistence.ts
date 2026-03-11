'use client'

import { useEffect, useCallback } from 'react'
import { type Message } from '../components/ChatMessage'

const SESSION_KEY = 'tr_session_v2'

interface SessionData {
  messages: Message[]
  filename: string
  savedAt: string
}

/** Serialize messages (Date → string) for storage */
function serialize(messages: Message[], filename: string): string {
  const data: SessionData = {
    messages: messages.map(m => ({ ...m, timestamp: m.timestamp.toISOString() })) as unknown as Message[],
    filename,
    savedAt: new Date().toISOString(),
  }
  return JSON.stringify(data)
}

/** Deserialize messages (string → Date) from storage */
function deserialize(raw: string): SessionData | null {
  try {
    const data = JSON.parse(raw) as SessionData
    data.messages = data.messages.map(m => ({
      ...m,
      timestamp: new Date(m.timestamp as unknown as string),
    }))
    return data
  } catch {
    return null
  }
}

export function useSessionPersistence(
  messages: Message[],
  filename: string,
) {
  // Save whenever messages change
  useEffect(() => {
    if (!messages.length) return
    try {
      localStorage.setItem(SESSION_KEY, serialize(messages, filename))
    } catch {
      // Storage full or unavailable — silently ignore
    }
  }, [messages, filename])

  // Load saved session
  const loadSession = useCallback((): SessionData | null => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (!raw) return null
      return deserialize(raw)
    } catch {
      return null
    }
  }, [])

  const clearSession = useCallback(() => {
    try { localStorage.removeItem(SESSION_KEY) } catch {}
  }, [])

  return { loadSession, clearSession }
}
