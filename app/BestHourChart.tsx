'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Pub {
  views: number
  uploaded_at: string
}

function fmt(n: number) {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(Math.round(n))
}

export default function BestHourChart({ videos }: { videos: Pub[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 text-center text-gray-600 text-sm">
        A carregar…
      </div>
    )
  }

  if (videos.length < 5) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 text-center text-gray-600 text-sm">
        Precisa de pelo menos 5 vídeos para análise de hora ideal (atual: {videos.length})
      </div>
    )
  }

  const hourMap: Record<number, { sum: number; count: number }> = {}
  for (const v of videos) {
    if (!v.uploaded_at) continue
    const h = new Date(v.uploaded_at).getUTCHours()
    if (!hourMap[h]) hourMap[h] = { sum: 0, count: 0 }
    hourMap[h].sum += v.views
    hourMap[h].count++
  }

  const data = Array.from({ length: 24 }, (_, h) => ({
    hour: `${String(h).padStart(2, '0')}h`,
    avg: hourMap[h] ? Math.round(hourMap[h].sum / hourMap[h].count) : 0,
    count: hourMap[h]?.count ?? 0,
  })).filter((d) => d.count > 0)

  const maxAvg = Math.max(...data.map((d) => d.avg))
  const bestHour = data.find((d) => d.avg === maxAvg)

  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-400">Melhor hora para publicar (UTC)</h3>
          <p className="text-xs text-gray-600">Média de views por hora de upload</p>
        </div>
        {bestHour && (
          <div className="text-right">
            <p className="text-xs text-gray-500">melhor hora</p>
            <p className="text-lg font-bold text-amber-400">{bestHour.hour}</p>
            <p className="text-xs text-gray-500">{fmt(bestHour.avg)} avg</p>
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barCategoryGap="20%">
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 10, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={fmt}
            tick={{ fontSize: 10, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip
            contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
            labelStyle={{ color: '#d1d5db', fontSize: 12 }}
            formatter={(v: number) => [`${fmt(v)} views avg`, '']}
          />
          <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
            {data.map((d) => (
              <Cell
                key={d.hour}
                fill={d.avg === maxAvg ? '#f59e0b' : '#3b82f6'}
                fillOpacity={d.avg === maxAvg ? 1 : 0.6}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
