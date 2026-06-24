'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface HistoryEntry {
  date: string
  views: number
  likes: number
  videos: number
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export default function StatsChart({ history }: { history: HistoryEntry[] }) {
  if (history.length < 2) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 text-center text-gray-600 text-sm">
        Aguardando dados — gráfico disponível com 2+ dias de histórico
      </div>
    )
  }

  const data = history.map((h) => ({
    ...h,
    label: new Date(h.date + 'T00:00:00Z').toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'short',
    }),
  }))

  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-4">Views acumuladas ao longo do tempo</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={fmt}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
            labelStyle={{ color: '#d1d5db', fontSize: 12 }}
            formatter={(v: number) => [fmt(v), 'Views']}
          />
          <Area
            type="monotone"
            dataKey="views"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#vg)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
