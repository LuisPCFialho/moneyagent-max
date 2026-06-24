'use client'

import { useState } from 'react'

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

function Card({ v }: { v: Pub }) {
  return (
    <a
      href={v.url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-gray-900 rounded-xl overflow-hidden hover:ring-2 hover:ring-red-500 transition-all group"
    >
      <div className="relative">
        <img src={v.thumbnail} alt={v.title} className="w-full h-36 object-cover" />
        <span className="absolute top-2 left-2 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          {v.category}
        </span>
        <span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full font-bold">
          👁 {fmt(v.views)}
        </span>
      </div>
      <div className="p-3">
        <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-red-400 transition-colors">
          {v.title}
        </p>
        <div className="flex gap-2 mt-2 text-xs">
          <span className="bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded-full">👁 {fmt(v.views)}</span>
          <span className="bg-green-900/60 text-green-300 px-2 py-0.5 rounded-full">👍 {fmt(v.likes)}</span>
          <span className="bg-yellow-900/60 text-yellow-300 px-2 py-0.5 rounded-full">💬 {fmt(v.comments)}</span>
        </div>
      </div>
    </a>
  )
}

type SortKey = 'date' | 'views' | 'likes' | 'comments'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'date', label: 'Recente' },
  { key: 'views', label: 'Views' },
  { key: 'likes', label: 'Likes' },
  { key: 'comments', label: 'Comentários' },
]

function sortVideos(videos: Pub[], key: SortKey): Pub[] {
  return [...videos].sort((a, b) => {
    if (key === 'date') return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
    return b[key] - a[key]
  })
}

export default function PublishedSection({ videos }: { videos: Pub[] }) {
  const categories = Array.from(new Set(videos.map((v) => v.category))).sort()
  const [sel, setSel] = useState<string>('All')
  const [sort, setSort] = useState<SortKey>('date')

  const counts: Record<string, number> = { All: videos.length }
  for (const c of categories) counts[c] = videos.filter((v) => v.category === c).length

  const filtered = sel === 'All' ? videos : videos.filter((v) => v.category === sel)
  const shown = sortVideos(filtered, sort)
  const tabs = ['All', ...categories]

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3 text-gray-300">
        🎬 Published — {videos.length} videos
      </h2>

      {/* Category filter + sort */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setSel(c)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                sel === c
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {c} <span className="opacity-60">({counts[c]})</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-gray-500">Ordenar:</span>
          {SORTS.map((s) => (
            <button
              type="button"
              key={s.key}
              onClick={() => setSort(s.key)}
              className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                sort === s.key
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="text-gray-600">No videos in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {shown.map((v) => (
            <Card key={v.id} v={v} />
          ))}
        </div>
      )}
    </section>
  )
}
