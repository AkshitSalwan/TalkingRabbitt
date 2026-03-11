'use client'

import { useEffect, useRef } from 'react'
import {
  Chart as ChartJSClass,
  type Chart as ChartInstance,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  BarController,       // ✅ needed
  LineController,      // ✅ needed
  Tooltip,
  Filler,
  type ChartData,
  type ChartOptions,
} from 'chart.js'

// Register all required controllers and elements
ChartJSClass.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  BarController,
  LineController,
  Tooltip,
  Filler
)

const BAR_COLORS  = ['rgba(181,112,58,0.75)', 'rgba(122,140,110,0.75)', 'rgba(26,18,9,0.65)', 'rgba(196,84,42,0.70)', 'rgba(200,212,192,0.85)', 'rgba(181,112,58,0.45)']
const BAR_BORDERS = ['#B5703A', '#7A8C6E', '#1A1209', '#C4542A', '#8A9A82', '#C4763C']

interface Props {
  chartType: 'bar' | 'line'
  labels: string[]
  values: number[]
  forecastValues?: (number | null)[]
  forecastStart?: number
}

export default function ChartDisplay({ chartType, labels, values, forecastValues, forecastStart }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef  = useRef<ChartInstance | null>(null)

  useEffect(() => {
    if (!canvasRef.current || !labels.length || !values.length) return
    chartRef.current?.destroy()
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    const isLine = chartType === 'line'
    const isForecast = forecastValues && forecastStart !== undefined

    const datasets: ChartData['datasets'] = []

    if (isForecast) {
      // Historical line
      datasets.push({
        label: 'Historical',
        data: values,
        borderColor: '#B5703A',
        backgroundColor: 'rgba(181,112,58,0.08)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#B5703A',
        pointBorderColor: '#F5F0E8',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      })
      // Forecast line (dashed)
      datasets.push({
        label: 'Forecast',
        data: forecastValues as number[],
        borderColor: '#7A8C6E',
        backgroundColor: 'rgba(122,140,110,0.07)',
        borderWidth: 2,
        borderDash: [6, 4],
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#7A8C6E',
        pointBorderColor: '#F5F0E8',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      })
    } else if (isLine) {
      datasets.push({
        label: 'Value',
        data: values,
        borderColor: '#B5703A',
        backgroundColor: 'rgba(181,112,58,0.10)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#B5703A',
        pointBorderColor: '#F5F0E8',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      })
    } else {
      datasets.push({
        label: 'Value',
        data: values,
        backgroundColor: labels.map((_, i) => BAR_COLORS[i % BAR_COLORS.length]),
        borderColor: labels.map((_, i) => BAR_BORDERS[i % BAR_BORDERS.length]),
        borderWidth: 1.5,
        borderRadius: 3,
      })
    }

    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 550, easing: 'easeInOutQuart' },
      plugins: {
        legend: { display: !!isForecast, labels: { font: { family: "'IBM Plex Mono', monospace", size: 11 }, color: '#6B5B45' } },
        tooltip: {
          backgroundColor: '#1A1209',
          titleColor: '#F5F0E8',
          bodyColor: '#EDE8DC',
          borderColor: 'rgba(181,112,58,0.4)',
          borderWidth: 1,
          padding: 10,
          titleFont: { family: "'IBM Plex Mono', monospace", size: 11 },
          bodyFont: { family: "'Lora', serif", size: 13 },
          callbacks: { label: (ctx) => ` ${Number(ctx.parsed.y).toLocaleString()}` },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { color: 'rgba(181,112,58,0.2)' },
          ticks: { color: '#6B5B45', font: { family: "'IBM Plex Mono', monospace", size: 11 } },
        },
        y: {
          grid: { color: 'rgba(181,112,58,0.07)' },
          border: { dash: [4, 4], color: 'transparent' },
          ticks: {
            color: '#6B5B45',
            font: { family: "'IBM Plex Mono', monospace", size: 11 },
            callback: (v) => {
              const n = Number(v)
              if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
              if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
              return n.toLocaleString()
            },
          },
        },
      },
    }

    chartRef.current = new ChartJSClass(ctx, { type: chartType, data: { labels, datasets }, options })
    return () => { chartRef.current?.destroy(); chartRef.current = null }
  }, [chartType, labels, values, forecastValues, forecastStart])

  if (!labels.length || !values.length) return null

  return (
    <div style={{ position: 'relative', height: 200, width: '100%' }}>
      <canvas ref={canvasRef} />
    </div>
  )
}