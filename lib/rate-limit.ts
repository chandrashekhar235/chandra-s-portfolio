import 'server-only'
import crypto from 'crypto'
import { getSupabaseServerClient } from './supabase'

// Fallback in-memory store for development when neither Upstash nor Supabase is configured
const inMemorySubmissions = new Map<string, number[]>()

export function hashIpAddress(ip: string): string {
  const salt = process.env.IP_HASH_SALT || 'dev_salt_portfolio_2026'
  return crypto.createHash('sha256').update(`${ip}:${salt}`).digest('hex')
}

export async function checkRateLimit(
  hashedIp: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const maxSubmissions = 5
  const windowSeconds = 3600 // 1 hour

  // 1. Upstash Redis (if configured)
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (upstashUrl && upstashToken) {
    try {
      const { Ratelimit } = await import('@upstash/ratelimit')
      const { Redis } = await import('@upstash/redis')

      const redis = new Redis({
        url: upstashUrl,
        token: upstashToken,
      })

      const ratelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(maxSubmissions, `${windowSeconds} s`),
        prefix: 'contact_ratelimit',
      })

      const result = await ratelimit.limit(hashedIp)
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: Math.ceil((result.reset - Date.now()) / 1000),
      }
    } catch (err) {
      console.warn('[RateLimit] Upstash error, falling back to DB/memory limiter:', (err as Error).name)
    }
  }

  // 2. Database-Based Rate Limit (Using Supabase contact_messages count within 1 hour)
  const supabase = getSupabaseServerClient()
  if (supabase) {
    try {
      const oneHourAgo = new Date(Date.now() - windowSeconds * 1000).toISOString()
      const { count, error } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('ip_hash', hashedIp)
        .gte('created_at', oneHourAgo)

      if (error) {
        console.warn('[RateLimit] Supabase count query error:', error.code)
      } else {
        const recentCount = count ?? 0
        const remaining = Math.max(0, maxSubmissions - recentCount)
        const isAllowed = recentCount < maxSubmissions

        return {
          success: isAllowed,
          limit: maxSubmissions,
          remaining,
          reset: windowSeconds,
        }
      }
    } catch (err) {
      console.warn('[RateLimit] Database query exception:', (err as Error).name)
    }
  }

  // 3. Fallback In-Memory Rate Limiter (For local testing & zero-configuration environments)
  const now = Date.now()
  const windowStart = now - windowSeconds * 1000
  const timestamps = (inMemorySubmissions.get(hashedIp) || []).filter((t) => t > windowStart)

  if (timestamps.length >= maxSubmissions) {
    const oldest = timestamps[0]
    const reset = Math.ceil((oldest + windowSeconds * 1000 - now) / 1000)
    return {
      success: false,
      limit: maxSubmissions,
      remaining: 0,
      reset: Math.max(1, reset),
    }
  }

  timestamps.push(now)
  inMemorySubmissions.set(hashedIp, timestamps)

  return {
    success: true,
    limit: maxSubmissions,
    remaining: maxSubmissions - timestamps.length,
    reset: windowSeconds,
  }
}
