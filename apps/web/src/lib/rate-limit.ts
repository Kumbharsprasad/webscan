// Simple in-memory token bucket rate limiter
interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();

const REFILL_RATE = 1; // 1 token per 60 seconds
const CAPACITY = 5; // Max 5 tokens
const REFILL_INTERVAL = 60 * 1000;

export function rateLimit(ip: string): boolean {
  const now = Date.now();
  
  if (!buckets.has(ip)) {
    buckets.set(ip, { tokens: CAPACITY - 1, lastRefill: now });
    return true; // Allowed
  }
  
  const bucket = buckets.get(ip)!;
  
  // Refill
  const timePassed = now - bucket.lastRefill;
  const refillTokens = Math.floor(timePassed / REFILL_INTERVAL) * REFILL_RATE;
  
  if (refillTokens > 0) {
    bucket.tokens = Math.min(CAPACITY, bucket.tokens + refillTokens);
    bucket.lastRefill = now;
  }
  
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return true; // Allowed
  }
  
  return false; // Rate limited
}
