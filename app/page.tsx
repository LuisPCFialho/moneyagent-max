export const revalidate = 300

interface Video {
  id: string
  title: string
  publishedAt: string
  thumbnail: string
  views: number
  likes: number
  comments: number
  url: string
}

interface QueueItem {
  id: number
  yt_title: string
  status: string
  scheduled_at: string
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('pt-PT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Lisbon',
  })
}

function Badge({ n, color }: { n: number; color: string }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {fmt(n)}
    </span>
  )
}

function VideoCard({ v }: { v: Video }) {
  return (
    <a
      href={v.url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-gray-900 rounded-xl overflow-hidden hover:ring-2 hover:ring-red-500 transition-all group"
    >
      <div className="relative">
        <img src={v.thumbnail} alt={v.title} className="w-full h-36 object-cover" />
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full font-bold">
          👁 {fmt(v.views)}
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-red-400 transition-colors">
          {v.title}
        </p>
        <p className="text-xs text-gray-500 mt-1">{fmtDate(v.publishedAt)}</p>
        <div className="flex gap-2 mt-2">
          <Badge n={v.views} color="bg-blue-900/60 text-blue-300" />
          <Badge n={v.likes} color="bg-green-900/60 text-green-300" />
          <Badge n={v.comments} color="bg-yellow-900/60 text-yellow-300" />
        </div>
      </div>
    </a>
  )
}

async function getPublished(): Promise<Video[]> {
  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'
    const res = await fetch(`${base}/api/videos`, { next: { revalidate: 300 } })
    const data = await res.json()
    return data.published ?? []
  } catch {
    return []
  }
}

async function getQueue(): Promise<QueueItem[]> {
  try {
    const res = await fetch(
      'https://raw.githubusercontent.com/LuisPCFialho/moneyagent-max/master/public/queue_snapshot.json',
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export default async function Page() {
  const [published, queue] = await Promise.all([getPublished(), getQueue()])

  const totalViews = published.reduce((s, v) => s + v.views, 0)
  const totalLikes = published.reduce((s, v) => s + v.likes, 0)

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <h1 className="text-2xl font-bold tracking-tight">MoneyAgent MAX</h1>
        </div>
        <div className="flex gap-6 text-sm text-gray-400">
          <span><span className="text-white font-semibold">{published.length}</span> published</span>
          <span><span className="text-white font-semibold">{fmt(totalViews)}</span> total views</span>
          <span><span className="text-white font-semibold">{fmt(totalLikes)}</span> total likes</span>
          <span><span className="text-white font-semibold">{queue.length}</span> in queue</span>
        </div>
      </div>

      {/* Upload Queue */}
      {queue.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-300">
            📋 Upload Queue — next {queue.length} videos
          </h2>
          <div className="bg-gray-900 rounded-xl divide-y divide-gray-800">
            {queue.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${
                    item.status === 'ready_to_upload' ? 'bg-green-400' :
                    item.status === 'generating' ? 'bg-yellow-400 animate-pulse' :
                    'bg-gray-600'
                  }`} />
                  <span className="text-sm text-gray-200 line-clamp-1 max-w-lg">{item.yt_title}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    item.status === 'ready_to_upload' ? 'bg-green-900/50 text-green-300' :
                    item.status === 'generating' ? 'bg-yellow-900/50 text-yellow-300' :
                    'bg-gray-800 text-gray-500'
                  }`}>
                    {item.status === 'ready_to_upload' ? 'pronto' :
                     item.status === 'generating' ? 'a gerar' : 'em fila'}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">{item.scheduled_at}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Published Videos */}
      <section>
        <h2 className="text-lg font-semibold mb-3 text-gray-300">
          🎬 Published Videos — sorted by views
        </h2>
        {published.length === 0 ? (
          <p className="text-gray-600">No published videos yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {published.map((v) => (
              <VideoCard key={v.id} v={v} />
            ))}
          </div>
        )}
      </section>

      <p className="text-xs text-gray-700 text-center">
        Auto-refreshes every 5 min · {new Date().toLocaleString('pt-PT', { timeZone: 'Europe/Lisbon' })}
      </p>
    </main>
  )
}
