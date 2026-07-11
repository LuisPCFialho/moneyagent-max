'use client'

import { useEffect, useState } from 'react'

interface Status {
  last_run_at: string
  next_upload_at: string
  uploads_today: number
  queue_breakdown: { script_ready: number; generating: number; ready_to_upload: number }
  mpt_online: boolean
  alerts?: string[]
  quota_blocked?: boolean
  retention_summary?: { avg_pct: number; n: number; enabled: boolean }
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}s atrás`
  if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`
  return `${Math.floor(diff / 3600)}h atrás`
}

function timeUntil(iso: string): string {
  if (!iso) return '—'
  const diff = Math.floor((new Date(iso).getTime() - Date.now()) / 1000)
  if (diff <= 0) return 'agora'
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`
}

export default function StatusBar({ status }: { status: Status }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30_000)
    return () => clearInterval(t)
  }, [])

  const alerts = status.alerts ?? []
  const ret = status.retention_summary

  return (
    <div className="space-y-3">
      {alerts.length > 0 && (
        <div className="bg-red-950/60 border border-red-800 rounded-xl px-4 py-2.5 flex items-center gap-2 flex-wrap">
          <span className="text-red-400">⚠️</span>
          {alerts.map((a) => (
            <span key={a} className="text-xs font-medium text-red-300 bg-red-900/50 px-2 py-0.5 rounded-full">
              {a}
            </span>
          ))}
        </div>
      )}
      {status.quota_blocked && (
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl px-4 py-2 text-xs text-amber-300">
          ⏳ Quota da API esgotada — uploads e stats retomam no próximo reset (08:10 UTC). Pausa normal, não é erro.
        </div>
      )}
      <div className="bg-gray-900 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-500 mb-1">Motor</p>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full shrink-0 ${status.mpt_online ? 'bg-green-400' : 'bg-red-500'}`} />
            <span className="text-gray-200">{status.mpt_online ? 'Online' : 'Offline'}</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">último ciclo {timeAgo(status.last_run_at)}</p>
        </div>

      <div>
        <p className="text-xs text-gray-500 mb-1">Uploads hoje</p>
        <p className="text-gray-200 font-mono text-sm">{status.uploads_today}</p>
        <p className="text-xs text-gray-500 mt-0.5">reset às 08:10 UTC</p>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-1">Próximo upload</p>
        <p className="text-gray-200 font-mono text-sm">{timeUntil(status.next_upload_at)}</p>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-1">Retenção média</p>
        {ret && ret.enabled && ret.n > 0 ? (
          <>
            <p className="text-gray-200 font-mono text-sm">{ret.avg_pct.toFixed(0)}%</p>
            <p className="text-xs text-gray-500 mt-0.5">{ret.n} vídeos · % visto</p>
          </>
        ) : (
          <>
            <p className="text-gray-500 font-mono text-sm">—</p>
            <p className="text-xs text-gray-600 mt-0.5">Analytics API off</p>
          </>
        )}
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-1">Buffer</p>
        <div className="flex gap-1.5 flex-wrap">
          <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full">
            📝 {status.queue_breakdown.script_ready}
          </span>
          <span className="text-xs bg-yellow-900/50 text-yellow-300 px-2 py-0.5 rounded-full">
            ⚙️ {status.queue_breakdown.generating}
          </span>
          <span className="text-xs bg-green-900/50 text-green-300 px-2 py-0.5 rounded-full">
            ✅ {status.queue_breakdown.ready_to_upload}
          </span>
        </div>
      </div>
      </div>
    </div>
  )
}
