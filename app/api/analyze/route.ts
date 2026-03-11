import { NextRequest, NextResponse } from 'next/server'
import { getAiAnalyticsResponse } from '../../lib/aiService'
import { buildCsvString } from '../../lib/dataUtils'

export async function POST(request: NextRequest) {
  let body: { query?: string; data?: Record<string, string>[]; context?: string } | null = null
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { query, data, context } = body ?? {}

  if (!query?.trim())
    return NextResponse.json({ error: 'Query cannot be empty.' }, { status: 400 })

  if (!data?.length)
    return NextResponse.json({ error: 'No dataset provided. Please upload a CSV file first.' }, { status: 400 })

  try {
    const csvString = buildCsvString(data)
    const result = await getAiAnalyticsResponse(query.trim(), csvString, context)
    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error('[/api/analyze]', error)
    return mapError(error)
  }
}

function mapError(error: unknown) {
  const msg = error instanceof Error ? error.message : 'An unexpected error occurred'
  if (msg.includes('authentication failed')) return NextResponse.json({ error: 'Invalid Gemini API key.' }, { status: 401 })
  if (msg.includes('rate limit exceeded'))   return NextResponse.json({ error: 'Rate limit reached. Please wait.' }, { status: 429 })
  if (msg.includes('request timeout'))       return NextResponse.json({ error: 'Request timed out.' }, { status: 504 })
  if (msg.includes('not configured'))        return NextResponse.json({ error: 'GEMINI_API_KEY not set in .env.local.' }, { status: 500 })
  return NextResponse.json({ error: msg }, { status: 500 })
}
