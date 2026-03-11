import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Talking Rabbitt – Conversational Business Analytics',
  description: 'Ask your business data anything. AI-powered insights and auto-generated charts.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
