'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  avg_view_pct: number
  uploaded_at: string
}

type Stats = { views: number; likes: number; comments: number }

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

// Auto-refresh keeps the numbers live without the engine's OAuth quota (it uses a
// separate API key via /api/refresh-stats). It's a serverless invocation, NOT a
// Vercel deployment, so it never touches the 100-builds/day limit. Gated on tab
// visibility so a backgrounded tab doesn't poll.
const AUTO_INTERVAL_MS = 4 * 60 * 1000
const MANUAL_COOLDOWN_S = 30

export default function LiveDashboard({ initialPublished }: { initialPublished: Pub[] }) {
  const [videos, setVideos] = useState(initialPublished)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const [cooldown, setCooldown] = useState(0)

  // The published set is fixed for the lifetime of a client session (new uploads
  // only appear on the next server render), so the id list is stable.
  const ids = useMemo(() => initialPublished.map((v) => v.id), [initialPublished])
  const inFlight = useRef(false)

  const doRefresh = useCallback(async (): Promise<void> => {
    if (inFlight.current || ids.length === 0) return
    inFlight.current = true
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/refresh-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Falha ao atualizar')
        return
      }
      const stats = data.stats as Record<string, Stats>
      setVideos((prev) => prev.map((v) => (stats[v.id] ? { ...v, ...stats[v.id] } : v)))
      setUpdatedAt(new Date())
    } catch {
      setError('Falha de rede')
    } finally {
      inFlight.current = false
      setLoading(false)
    }
  }, [ids])

  function manualRefresh() {
    if (loading || cooldown > 0) return
    void doRefresh()
    let remaining = MANUAL_COOLDOWN_S
    setCooldown(remaining)
    const t = setInterval(() => {
      remaining -= 1
      setCooldown(remaining)
      if (remaining <= 0) clearInterval(t)
    }, 1000)
  }

  // Auto-refresh: once on mount, then every AUTO_INTERVAL_MS while visible, plus
  // an immediate refresh whenever the tab regains focus.
  useEffect(() => {
    void doRefresh()
    const tick = () => {
      if (document.visibilityState === 'visible') void doRefresh()
    }
    const interval = setInterval(tick, AUTO_INTERVAL_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') void doRefresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [doRefresh])

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
          {loading ? (
            <span className="text-xs text-gray-500">a atualizar…</span>
          ) : updatedAt ? (
            <span className="text-xs text-gray-600">
              atualizado às {updatedAt.toLocaleTimeString('pt-PT')}
            </span>
          ) : null}
          {error && <span className="text-xs text-red-400">{error}</span>}
          <button
            type="button"
            onClick={manualRefresh}
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
