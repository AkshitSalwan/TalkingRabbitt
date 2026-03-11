'use client'

import { useEffect } from 'react'

interface Shortcuts {
  onFocusInput: () => void
  onUploadFile: () => void
  onClearChat: () => void
}

export function useKeyboardShortcuts({ onFocusInput, onUploadFile, onClearChat }: Shortcuts) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey

      // Cmd/Ctrl+K → focus input
      if (meta && e.key === 'k') {
        e.preventDefault()
        onFocusInput()
      }

      // Cmd/Ctrl+E → trigger file upload
      if (meta && e.key === 'e') {
        e.preventDefault()
        onUploadFile()
      }

      // Cmd/Ctrl+Shift+X → clear chat
      if (meta && e.shiftKey && e.key === 'X') {
        e.preventDefault()
        onClearChat()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onFocusInput, onUploadFile, onClearChat])
}
