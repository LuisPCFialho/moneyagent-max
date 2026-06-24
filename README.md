# MoneyAgent MAX — Dashboard

Real-time dashboard for the **MoneyAgent MAX** YouTube channel.

- **Published videos** sorted by views, with thumbnail, link, and live stats (views / likes / comments).
- **Upload queue** showing the next videos and their estimated publish time.
- Auto-refreshes every 5 minutes (ISR).

Data sources:
- Published videos: YouTube Data API v3 (public read key).
- Upload queue: `public/queue_snapshot.json`, pushed by `perpetual_engine.py`.

## Environment variables (Vercel → Settings → Environment Variables)

| Name                 | Value                                   |
|----------------------|-----------------------------------------|
| `YOUTUBE_API_KEY`    | Public YouTube Data API v3 key          |
| `YOUTUBE_CHANNEL_ID` | `UCgrc5eo96mH5lbCFUM8Q8sg`              |
