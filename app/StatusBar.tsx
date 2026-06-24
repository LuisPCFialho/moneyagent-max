'use client'

import { useEffect, useState } from 'react'

interface Status {
  last_run_at: string
  next_upload_at: string
  uploads_today: number
  quota_max: number
  queue_breakdown: { script_ready: number; generating: number; ready_to_upload: number }
  mpt_online: boolean
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

  const pct = Math.min(100, Math.round((status.uploads_today / status.quota_max) * 100))

  return (
    <div className="bg-gray-900 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
      <div>
        <p className="text-xs text-gray-500 mb-1">Motor</p>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full shrink-0 ${status.mpt_online ? 'bg-green-400' : 'bg-red-500'}`} />
          <span className="text-gray-200">{status.mpt_online ? 'Online' : 'Offline'}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">último ciclo {timeAgo(status.last_run_at)}</p>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-1">Quota diária</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${pct >= 100 ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-gray-300 shrink-0">{status.uploads_today}/{status.quota_max}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">reset às 08:10 UTC</p>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-1">Próximo upload</p>
        <p className="text-gray-200 font-mono text-sm">{timeUntil(status.next_upload_at)}</p>
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
  )
}
