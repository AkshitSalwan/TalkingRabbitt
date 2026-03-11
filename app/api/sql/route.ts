import { NextRequest, NextResponse } from 'next/server'

// SQL execution happens client-side via alasql.
// This route exists for server-side query validation and sanitization.

const BLOCKED = ['drop', 'delete', 'insert', 'update', 'alter', 'create', 'truncate', 'exec', 'execute']

export async function POST(request: NextRequest) {
  let body: { query?: string } | null = null
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { query } = body ?? {}
  if (!query?.trim())
    return NextResponse.json({ error: 'SQL query cannot be empty.' }, { status: 400 })

  const lower = query.toLowerCase()
  const blocked = BLOCKED.find(w => lower.includes(w))
  if (blocked)
    return NextResponse.json({ error: `Query contains forbidden keyword: ${blocked}. Only SELECT is allowed.` }, { status: 400 })

  if (!lower.trim().startsWith('select'))
    return NextResponse.json({ error: 'Only SELECT queries are allowed.' }, { status: 400 })

  return NextResponse.json({ valid: true, query: query.trim() })
}
