import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * AI service — Integrates with Google Gemini 2.5 Flash
 */

export interface AnalyticsResponse {
  answer: string
  chartType: 'bar' | 'line'
  labels: string[]
  values: number[]
}

export interface AutoSummary {
  rowCount: number
  columnCount: number
  columns: { name: string; type: 'numeric' | 'categorical' | 'date' }[]
  insights: string[]
  anomalies: string[]
  dataQuality: { issue: string; severity: 'low' | 'medium' | 'high' }[]
}

export interface ForecastResponse {
  answer: string
  labels: string[]
  historicalValues: number[]
  forecastValues: (number | null)[]
  forecastStart: number
}

/** Shared: get model instance */
const getModel = () => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY environment variable not configured')
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
}

/** Shared: clean and parse JSON from Gemini response */
const parseJSON = <T>(text: string): T => {
  let cleaned = text.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Could not parse AI response as JSON')
  }
}

/** Shared: classify errors */
const classifyError = (error: unknown): never => {
  const message = error instanceof Error ? error.message : String(error)
  if (message.includes('API key') || message.includes('authentication') || message.includes('API_KEY_INVALID'))
    throw new Error('Gemini API authentication failed')
  if (message.includes('429') || message.includes('quota') || message.includes('rate limit'))
    throw new Error('Gemini API rate limit exceeded')
  if (message.includes('timeout') || message.includes('DEADLINE'))
    throw new Error('Gemini API request timeout')
  throw new Error(`Gemini API error: ${message}`)
}

/**
 * Get AI analytics response from structured CSV data
 */
export const getAiAnalyticsResponse = async (
  question: string,
  csvString: string,
  conversationContext?: string,
): Promise<AnalyticsResponse> => {
  try {
    const model = getModel()
    const contextBlock = conversationContext
      ? `\nRECENT CONVERSATION CONTEXT (for follow-up understanding):\n${conversationContext}\n`
      : ''

    const prompt = `You are a business data analyst. Analyze the following CSV dataset and answer the user's question.
${contextBlock}
CSV DATA:
${csvString}

USER QUESTION: ${question}

Respond ONLY with a valid JSON object — no markdown, no code fences, no text outside the JSON.
{
  "answer": "A clear, insightful answer (2-3 sentences)",
  "chartType": "bar",
  "labels": ["label1", "label2"],
  "values": [1000, 2000]
}

Rules:
- chartType must be "bar" (comparisons) or "line" (time trends)
- labels and values arrays must be the same length
- values must be plain numbers only
- If not chartable, use empty arrays
- Do not include any text outside the JSON`

    const result = await model.generateContent(prompt)
    const response = result.response
    if (!response?.text()) throw new Error('No response from Gemini API')

    const parsed = parseJSON<AnalyticsResponse>(response.text())
    if (!parsed.answer || !parsed.chartType) throw new Error('Invalid response structure from Gemini API')
    parsed.labels = parsed.labels ?? []
    parsed.values = parsed.values ?? []
    return parsed
  } catch (err) {
    classifyError(err)
  }
}

/**
 * Auto-analyze a dataset and return summary, insights, anomalies, quality issues
 */
export const getAutoSummary = async (csvString: string): Promise<AutoSummary> => {
  try {
    const model = getModel()
    const prompt = `You are a data analyst. Analyze this CSV dataset and return a structured summary.

CSV DATA:
${csvString}

Respond ONLY with a valid JSON object:
{
  "rowCount": 100,
  "columnCount": 3,
  "columns": [
    { "name": "region", "type": "categorical" },
    { "name": "month", "type": "date" },
    { "name": "revenue", "type": "numeric" }
  ],
  "insights": [
    "Top 3 business insights about this data, each 1 sentence"
  ],
  "anomalies": [
    "Any outliers or unusual patterns found, or empty array if none"
  ],
  "dataQuality": [
    { "issue": "description of issue", "severity": "low" }
  ]
}

Rules:
- column type must be exactly: "numeric", "categorical", or "date"
- severity must be exactly: "low", "medium", or "high"
- insights array must have exactly 3 items
- anomalies and dataQuality can be empty arrays
- No text outside JSON`

    const result = await model.generateContent(prompt)
    if (!result.response?.text()) throw new Error('No response from Gemini API')
    return parseJSON<AutoSummary>(result.response.text())
  } catch (err) {
    classifyError(err)
  }
}

/**
 * Generate a trend forecast from historical data
 */
export const getForecast = async (
  question: string,
  csvString: string,
): Promise<ForecastResponse> => {
  try {
    const model = getModel()
    const prompt = `You are a business forecasting analyst. Analyze this CSV data and provide a forecast.

CSV DATA:
${csvString}

USER QUESTION: ${question}

Respond ONLY with a valid JSON object:
{
  "answer": "Explanation of the trend and forecast (2-3 sentences)",
  "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  "historicalValues": [1000, 1200, 1100, 1300, 1250, 1400],
  "forecastValues": [null, null, null, null, null, null, 1500, 1600, 1700],
  "forecastStart": 6
}

Rules:
- labels covers all periods (historical + forecast)
- historicalValues has nulls where forecast is (same length as labels)
- forecastValues has nulls where history is (same length as labels)
- forecastStart is the index where forecast begins
- Forecast 3 future periods beyond the data
- No text outside JSON`

    const result = await model.generateContent(prompt)
    if (!result.response?.text()) throw new Error('No response from Gemini API')
    return parseJSON<ForecastResponse>(result.response.text())
  } catch (err) {
    classifyError(err)
  }
}
