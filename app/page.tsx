import PublishedSection from './PublishedSection'

export const revalidate = 120

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

interface QueueItem {
  id: number
  yt_title: string
  status: string
  category: string
  scheduled_at: string
}

const RAW = 'https://raw.githubusercontent.com/LuisPCFialho/moneyagent-max/master/public'

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

async function getJSON<T>(file: string): Promise<T[]> {
  try {
    const res = await fetch(`${RAW}/${file}`, { next: { revalidate: 120 } })
    if (!res.ok) return []
    return (await res.json()) as T[]
  } catch {
    return []
  }
}

export default async function Page() {
  const [published, queue] = await Promise.all([
    getJSON<Pub>('published_snapshot.json'),
    getJSON<QueueItem>('queue_snapshot.json'),
  ])

  const totalViews = published.reduce((s, v) => s + v.views, 0)
  const totalLikes = published.reduce((s, v) => s + v.likes, 0)

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <h1 className="text-2xl font-bold tracking-tight">MoneyAgent MAX</h1>
        </div>
        <div className="flex gap-6 text-sm text-gray-400">
          <span><span className="text-white font-semibold">{published.length}</span> published</span>
          <span><span className="text-white font-semibold">{fmt(totalViews)}</span> views</span>
          <span><span className="text-white font-semibold">{fmt(totalLikes)}</span> likes</span>
          <span><span className="text-white font-semibold">{queue.length}</span> in queue</span>
        </div>
      </div>

      {/* Published — filterable by category */}
      <PublishedSection videos={published} />

      {/* Upload queue */}
      {queue.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-300">
            📋 Upload Queue — next {queue.length}
          </h2>
          <div className="bg-gray-900 rounded-xl divide-y divide-gray-800">
            {queue.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    item.status === 'ready_to_upload' ? 'bg-green-400' :
                    item.status === 'generating' ? 'bg-yellow-400 animate-pulse' :
                    'bg-gray-600'
                  }`} />
                  <span className="text-xs text-gray-500 shrink-0 w-20 truncate">{item.category}</span>
                  <span className="text-sm text-gray-200 truncate">{item.yt_title}</span>
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
                  <span className="text-xs text-gray-500 font-mono w-24 text-right">{item.scheduled_at}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="text-xs text-gray-700 text-center">
        Auto-refreshes every 2 min · MoneyAgent MAX engine
      </p>
    </main>
  )
}
