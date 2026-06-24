import { NextResponse } from 'next/server'

const API_KEY = process.env.YOUTUBE_API_KEY!
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || 'UCgrc5eo96mH5lbCFUM8Q8sg'
const BASE = 'https://www.googleapis.com/youtube/v3'

interface Video {
  id: string
  title: string
  publishedAt: string
  thumbnail: string
  views: number
  likes: number
  comments: number
  url: string
  status: 'published'
}

export async function GET() {
  try {
    // Fetch all video IDs from channel (up to 50 most recent)
    const searchRes = await fetch(
      `${BASE}/search?channelId=${CHANNEL_ID}&type=video&order=date&maxResults=50&part=id&key=${API_KEY}`,
      { next: { revalidate: 300 } }
    )
    const searchData = await searchRes.json()
    if (!searchData.items?.length) return NextResponse.json({ published: [], total: 0 })

    const ids: string[] = searchData.items.map((i: any) => i.id.videoId)

    // Fetch stats + snippet in one call
    const statsRes = await fetch(
      `${BASE}/videos?id=${ids.join(',')}&part=statistics,snippet&key=${API_KEY}`,
      { next: { revalidate: 300 } }
    )
    const statsData = await statsRes.json()

    const published: Video[] = (statsData.items ?? []).map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      publishedAt: item.snippet.publishedAt,
      thumbnail: item.snippet.thumbnails?.medium?.url ?? '',
      views: parseInt(item.statistics.viewCount ?? '0'),
      likes: parseInt(item.statistics.likeCount ?? '0'),
      comments: parseInt(item.statistics.commentCount ?? '0'),
      url: `https://youtu.be/${item.id}`,
      status: 'published' as const,
    })).sort((a: Video, b: Video) => b.views - a.views)

    return NextResponse.json({ published, total: published.length })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
