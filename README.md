# 🐇 Talking Rabbitt

**Conversational Business Analytics** — Ask questions about your CSV data in plain English and get AI-powered insights with automatic visualizations.

---

## What It Does

Upload any CSV file, then chat naturally with your data:

- *"Which region had the highest revenue?"*
- *"Show me the revenue trend by month"*
- *"Which region performed best in Q1?"*

Talking Rabbitt uses **Google Gemini** to analyze your data and automatically renders **bar or line charts** based on what best represents the answer.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, Tailwind CSS |
| Backend | Next.js API Routes |
| AI | Google Gemini 1.5 Flash |
| CSV Parsing | PapaParse |
| Charts | Chart.js + react-chartjs-2 |
| Deployment | Vercel |

---

## Getting Started

### 1. Prerequisites

- Node.js 18+
- A Google Gemini API key → [Get one free](https://aistudio.google.com/app/apikey)

### 2. Clone & Install

```bash
git clone https://github.com/your-username/talking-rabbitt.git
cd talking-rabbitt
npm install
```

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your key:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
talking-rabbitt/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts          # Gemini API integration
│   ├── components/
│   │   ├── CSVUpload.tsx          # File upload with drag & drop
│   │   ├── ChatMessage.tsx        # Individual message bubbles
│   │   ├── ChartDisplay.tsx       # Chart.js bar/line charts
│   │   ├── DataPreview.tsx        # Dataset table preview
│   │   ├── LoadingIndicator.tsx   # Animated loading dots
│   │   └── SuggestedQuestions.tsx # Quick-start question chips
│   ├── globals.css                # Design tokens + animations
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main application page
├── public/
│   └── sample-sales-data.csv      # Example dataset
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Deploying on Vercel

### Option A: One-Click (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Import your GitHub repository
2. Add environment variable: `GEMINI_API_KEY`
3. Click **Deploy**

### Option B: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

When prompted, add your environment variable:
```
GEMINI_API_KEY = your_key_here
```

### Option C: Vercel Dashboard

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import repository
4. Under **Environment Variables**, add:
   - `GEMINI_API_KEY` = `your_key_here`
5. Click **Deploy**

No build configuration needed — Vercel auto-detects Next.js.

---

## Example Dataset

A sample dataset is included at `public/sample-sales-data.csv`:

```csv
region,month,revenue,units_sold,target
North,Jan,42500,320,40000
South,Jan,31200,240,35000
East,Jan,38100,292,38000
West,Jan,27600,212,30000
...
```

**Try these questions with the sample data:**
- *"Which region had the highest total revenue?"*
- *"Show the North region's revenue trend over the year"*
- *"Compare all regions in Q1 (Jan, Feb, Mar)"*
- *"Which month had the best performance overall?"*
- *"How does actual revenue compare to targets?"*

---

## CSV Format

Your CSV can have any schema. Talking Rabbitt works best with:

- **Categorical columns**: region, product, category, team
- **Time columns**: month, quarter, year, date
- **Numeric columns**: revenue, sales, units, profit, cost

**Minimum requirements**: 2+ columns, at least one numeric column.

**Supported size**: Up to ~5MB / ~10,000 rows

---

## API Reference

### `POST /api/analyze`

**Request:**
```json
{
  "query": "Which region had the highest revenue?",
  "data": [{ "region": "North", "month": "Jan", "revenue": "42500" }]
}
```

**Response:**
```json
{
  "answer": "The North region generated the highest total revenue at $672,700.",
  "chartType": "bar",
  "labels": ["North", "East", "South", "West"],
  "values": [672700, 583700, 527700, 486100]
}
```

**Error Response:**
```json
{
  "error": "Human-readable error message"
}
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ | Google Gemini API key |

---

## Local Development Tips

- The app uses **Gemini 1.5 Flash** (fast + free tier available)
- CSV data is parsed client-side with PapaParse
- Charts re-render automatically on each AI response
- Press **Enter** to submit, **Shift+Enter** for new lines

---

## License

MIT — build something great.

---

*Made with ☕ and a talking rabbit.*
