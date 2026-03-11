import { NextRequest, NextResponse } from 'next/server'
import { getForecast } from '../../lib/aiService'
import { buildCsvString } from '../../lib/dataUtils'

export async function POST(request: NextRequest) {
  let body: { query?: string; data?: Record<string, string>[] } | null = null
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { query, data } = body ?? {}
  if (!query?.trim())
    return NextResponse.json({ error: 'Query cannot be empty.' }, { status: 400 })
  if (!data?.length)
    return NextResponse.json({ error: 'No data provided.' }, { status: 400 })

  try {
    const csvString = buildCsvString(data)
    const result = await getForecast(query.trim(), csvString)
    return NextResponse.json(result)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Forecast failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
