'use client'

import { useState } from 'react'
import PublishedSection from './PublishedSection'
import Top3Section from './Top3Section'
import BestHourChart from './BestHourChart'

interface Pub {
  id: string
  title: string
  category: string
  url: string
  thumbnail: string
  views: number
  likes: number
  comments: number
  uploaded_at: string
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

const COOLDOWN_S = 30

export default function LiveDashboard({ initialPublished }: { initialPublished: Pub[] }) {
  const [videos, setVideos] = useState(initialPublished)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const [cooldown, setCooldown] = useState(0)

  async function refresh() {
    if (loading || cooldown > 0) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/refresh-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: videos.map((v) => v.id) }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Falha ao atualizar')
        return
      }
      setVideos((prev) =>
        prev.map((v) => (data.stats[v.id] ? { ...v, ...data.stats[v.id] } : v))
      )
      setUpdatedAt(new Date())
      let remaining = COOLDOWN_S
      setCooldown(remaining)
      const t = setInterval(() => {
        remaining -= 1
        setCooldown(remaining)
        if (remaining <= 0) clearInterval(t)
      }, 1000)
    } catch {
      setError('Falha de rede')
    } finally {
      setLoading(false)
    }
  }

  const totalViews = videos.reduce((s, v) => s + v.views, 0)
  const totalLikes = videos.reduce((s, v) => s + v.likes, 0)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-6 text-sm text-gray-400">
          <span><span className="text-white font-semibold">{videos.length}</span> publicados</span>
          <span><span className="text-white font-semibold">{fmt(totalViews)}</span> views</span>
          <span><span className="text-white font-semibold">{fmt(totalLikes)}</span> likes</span>
        </div>
        <div className="flex items-center gap-2">
          {updatedAt && (
            <span className="text-xs text-gray-600">
              atualizado às {updatedAt.toLocaleTimeString('pt-PT')}
            </span>
          )}
          {error && <span className="text-xs text-red-400">{error}</span>}
          <button
            type="button"
            onClick={refresh}
            disabled={loading || cooldown > 0}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${
              loading || cooldown > 0
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-500'
            }`}
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            {loading ? 'A atualizar…' : cooldown > 0 ? `Aguarda ${cooldown}s` : 'Atualizar agora'}
          </button>
        </div>
      </div>

      <PublishedSection videos={videos} />
      <Top3Section videos={videos} />

      <section>
        <h2 className="text-lg font-semibold mb-3 text-gray-300">⏰ Análise de Hora de Publicação</h2>
        <BestHourChart videos={videos} />
      </section>
    </div>
  )
}
