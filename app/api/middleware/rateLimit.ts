import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function rateLimit(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const key = `ratelimit_${ip}`
  const limit = 100 // Number of requests
  const duration = 60 * 60 // 1 hour in seconds

  const requests = await redis.incr(key)
  if (requests === 1) {
    await redis.expire(key, duration)
  }

  if (requests > limit) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  return null
}

