'use client'

interface Pub {
  id: string
  title: string
  category: string
  url: string
  thumbnail: string
  views: number
  likes: number
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

const CAT_ORDER = [
  'Animals', 'Space', 'Human Body', 'Science',
  'History', 'Psychology', 'Nature', 'Technology',
]

export default function Top3Section({ videos }: { videos: Pub[] }) {
  const cats = CAT_ORDER.filter((c) => videos.some((v) => v.category === c))
  if (cats.length === 0) return null

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4 text-gray-300">🏆 Top 3 por Categoria</h2>
      <div className="space-y-5">
        {cats.map((cat) => {
          const top3 = [...videos]
            .filter((v) => v.category === cat)
            .sort((a, b) => b.views - a.views)
            .slice(0, 3)
          return (
            <div key={cat}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">{cat}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {top3.map((v, i) => (
                  <a
                    key={v.id}
                    href={v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-gray-900 rounded-xl p-3 hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-xl font-bold text-gray-700 w-5 shrink-0 text-center">{i + 1}</span>
                    <img
                      src={v.thumbnail}
                      alt={v.title}
                      className="w-16 h-10 object-cover rounded shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium leading-snug line-clamp-2 text-gray-200">{v.title}</p>
                      <p className="text-xs text-blue-400 mt-0.5">👁 {fmt(v.views)}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
