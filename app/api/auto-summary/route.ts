import { NextRequest, NextResponse } from 'next/server'
import { getAutoSummary } from '../../lib/aiService'
import { buildCsvString } from '../../lib/dataUtils'

export async function POST(request: NextRequest) {
  let body: { data?: Record<string, string>[] } | null = null
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { data } = body ?? {}
  if (!data?.length)
    return NextResponse.json({ error: 'No data provided.' }, { status: 400 })

  try {
    const csvString = buildCsvString(data, 100)
    const result = await getAutoSummary(csvString)
    return NextResponse.json(result)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to generate summary'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
