import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface StatsMap {
  [videoId: string]: { views: number; likes: number; comments: number }
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

export async function POST(req: NextRequest) {
  const key = process.env.YOUTUBE_API_KEY
  if (!key) {
    return NextResponse.json({ error: 'YOUTUBE_API_KEY não configurada' }, { status: 500 })
  }

  const body = await req.json().catch(() => null)
  const ids: string[] = Array.isArray(body?.ids) ? body.ids.filter((x: unknown) => typeof x === 'string') : []
  if (ids.length === 0) {
    return NextResponse.json({ error: 'Sem ids' }, { status: 400 })
  }

  const stats: StatsMap = {}
  for (const batch of chunk(ids, 50)) {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${batch.join(',')}&key=${key}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) {
      const errBody = await res.json().catch(() => null)
      const reason = errBody?.error?.errors?.[0]?.reason
      if (reason === 'quotaExceeded') {
        return NextResponse.json({ error: 'Quota da API do YouTube esgotada — tenta mais tarde' }, { status: 429 })
      }
      return NextResponse.json({ error: errBody?.error?.message || 'Erro a contactar o YouTube' }, { status: res.status })
    }
    const data = await res.json()
    for (const item of data.items ?? []) {
      stats[item.id] = {
        views: Number(item.statistics?.viewCount ?? 0),
        likes: Number(item.statistics?.likeCount ?? 0),
        comments: Number(item.statistics?.commentCount ?? 0),
      }
    }
  }

  return NextResponse.json({ stats, updatedAt: new Date().toISOString() })
}
