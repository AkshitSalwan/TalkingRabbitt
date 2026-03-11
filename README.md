# 🐇 TalkingRabbitt

> **Conversational Business Analytics** — Upload a CSV, ask questions in plain English, write SQL, forecast trends, and export beautiful reports. Powered by Google Gemini 2.5 Flash.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-orange?style=flat-square&logo=google)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)

---

## What It Does

TalkingRabbitt turns any CSV file into a fully interactive analytics session:

- 🤖 **Ask anything** — natural language questions answered by Gemini AI with auto-generated charts
- 📈 **Forecast trends** — predict future performance based on historical data
- 🗄️ **Write SQL** — run SELECT queries directly against your dataset in-browser
- 🔍 **Auto-analysis** — instant insights, anomaly detection, and data quality warnings on upload
- 📄 **Export PDF reports** — download a full report of your entire session
- 🔗 **Share sessions** — generate a shareable link encoding your conversation
- 💾 **Session persistence** — conversations survive page refresh via localStorage

---

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/AkshitSalwan/TalkingRabbitt.git
cd TalkingRabbitt

# 2. Install dependencies
npm install

# 3. Set your Gemini API key
cp .env.example .env.local
# Edit .env.local → GEMINI_API_KEY=your_key_here

# 4. Run locally
npm run dev
# → Open http://localhost:3000
```

> 🔑 Get a **free** Gemini API key at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

---

## Deploy to Vercel

### Option A — One Click
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import repo
3. Add environment variable: `GEMINI_API_KEY` = `your_key`
4. Click **Deploy** ✅

### Option B — Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
# Set GEMINI_API_KEY when prompted
```

No build configuration needed — Vercel auto-detects Next.js.

---

## Features

### 💬 Chat Mode
Ask questions in plain English and get AI-powered insights with automatic bar or line chart visualizations.

```
"Which region had the highest revenue?"
"Show revenue trend by month"
"Compare Q1 vs Q2 performance"
```

### 📈 Forecast Mode
Ask about future trends and get a dual-line chart showing historical data alongside AI-projected values.

```
"What will North region revenue look like next quarter?"
"Forecast total revenue for the next 3 months"
```

### 🗄️ SQL Mode
Write raw SQL queries against your dataset using AlaSQL — all executed in-browser, no server needed.

```sql
SELECT region, SUM(CAST(revenue AS NUMBER)) as total
FROM data
GROUP BY region
ORDER BY total DESC
```

### 🔍 Auto-Analysis
Every time you upload a CSV, Rabbitt automatically runs a full analysis:
- Key business insights (3 AI-generated)
- Anomaly detection
- Data quality warnings (missing values, duplicates)
- Column type classification

### 🎛️ Column Selector
Filter which columns Gemini considers per query — useful for wide datasets with many irrelevant fields.

### 📄 PDF Export
Export your entire session — all questions, AI answers, and charts — as a formatted PDF report.

### 🔗 Share Sessions
Encode your conversation as a URL fragment and share it with colleagues.

### ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `⌘/Ctrl + K` | Focus chat input |
| `⌘/Ctrl + E` | Open CSV file picker |
| `⌘/Ctrl + ⇧ + X` | Clear chat history |
| `Enter` | Send message |
| `⇧ + Enter` | New line in input |
| `⌘/Ctrl + Enter` | Run SQL query |

---

## Project Structure

```
TalkingRabbitt/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts          ← Chat Q&A endpoint
│   │   ├── auto-summary/route.ts     ← Auto-analysis on upload
│   │   ├── forecast/route.ts         ← Trend forecasting endpoint
│   │   └── sql/route.ts              ← SQL query validation
│   ├── components/
│   │   ├── AutoSummaryCard.tsx       ← Insights + anomalies + quality
│   │   ├── ChatMessage.tsx           ← Message bubbles (copy + PNG export)
│   │   ├── ChartDisplay.tsx          ← Bar / line / forecast charts
│   │   ├── ColumnSelector.tsx        ← Filter columns per query
│   │   ├── CSVUpload.tsx             ← Drag-and-drop file uploader
│   │   ├── DataPreview.tsx           ← Dataset table preview
│   │   ├── ExportReport.tsx          ← PDF report generator
│   │   ├── KeyboardHints.tsx         ← Shortcut reference bar
│   │   ├── LoadingIndicator.tsx      ← Animated loading dots
│   │   ├── ShareLink.tsx             ← Shareable URL generator
│   │   ├── SqlMode.tsx               ← In-browser SQL with AlaSQL
│   │   └── SuggestedQuestions.tsx    ← Quick-start question chips
│   ├── hooks/
│   │   ├── useKeyboardShortcuts.ts   ← Global keyboard bindings
│   │   └── useSessionPersistence.ts  ← localStorage session save/restore
│   ├── lib/
│   │   ├── aiService.ts              ← Gemini 2.5 Flash integration
│   │   └── dataUtils.ts              ← Column detection, CSV builder, share encoder
│   ├── globals.css                   ← Design tokens + animations
│   ├── layout.tsx
│   └── page.tsx                      ← Main application
├── public/
│   └── sample-sales-data.csv         ← Example dataset (48 rows, 4 regions)
├── next.config.js                    ← Webpack alias for AlaSQL compat
├── .env.example
└── package.json
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS |
| AI | Google Gemini 2.5 Flash |
| CSV Parsing | PapaParse |
| Charts | Chart.js + react-chartjs-2 |
| SQL Engine | AlaSQL (client-side) |
| PDF Export | jsPDF + html2canvas |
| Deployment | Vercel |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ | Google Gemini API key |

---

## Example Dataset

A sample dataset is included at `public/sample-sales-data.csv`:

```csv
region,month,revenue,units_sold,target
North,Jan,42500,320,40000
South,Jan,31200,240,35000
East,Jan,38100,292,38000
West,Jan,27600,212,30000
...48 rows total
```

**Try these questions:**
- *"Which region had the highest total revenue?"*
- *"Show the revenue trend over the year"*
- *"Compare all regions in Q1"*
- *"Forecast North region revenue for next quarter"*
- *"Which month beat its target by the most?"*

---

## Known Issues & Fixes

**AlaSQL `react-native-fetch-blob` error**
Fixed in `next.config.js` via webpack alias — already included in this repo.

**Gemini API cold start**
First request after idle may take 3–5s. Subsequent requests are fast.

---

## License

MIT — build something great.

---

*Made with ☕ by [Akshit Salwan](https://github.com/AkshitSalwan)*
