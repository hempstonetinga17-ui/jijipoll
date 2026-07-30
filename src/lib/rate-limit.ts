type RateLimitEntry = {
  count: number;
  resetAt: number;
};

// In-memory store
const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  store.forEach((entry, key) => {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  });
}, 5 * 60 * 1000);

export function rateLimit(ip: string, limit: number, windowMs: number) {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry) {
    store.set(ip, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { success: true, remaining: limit - 1, reset: now + windowMs };
  }

  if (now > entry.resetAt) {
    store.set(ip, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { success: true, remaining: limit - 1, reset: now + windowMs };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, reset: entry.resetAt };
  }

  entry.count += 1;
  store.set(ip, entry);

  return { success: true, remaining: limit - entry.count, reset: entry.resetAt };
}
