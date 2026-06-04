import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 }); // 5 min default TTL

let cacheHits = 0;
let cacheMisses = 0;

export function getCacheStats() {
  return { hits: cacheHits, misses: cacheMisses };
}

export function getCache<T>(key: string): T | undefined {
  const value = cache.get<T>(key);
  if (value !== undefined) {
    cacheHits++;
    console.log(`[CACHE PERFORMANCE] HIT for key: "${key}" (Total Hits: ${cacheHits}, Misses: ${cacheMisses})`);
  } else {
    cacheMisses++;
    console.log(`[CACHE PERFORMANCE] MISS for key: "${key}" (Total Hits: ${cacheHits}, Misses: ${cacheMisses})`);
  }
  return value;
}

export function setCache<T>(key: string, value: T, ttlSeconds = 300): void {
  cache.set(key, value, ttlSeconds);
  console.log(`[CACHE PERFORMANCE] SET key: "${key}" with TTL: ${ttlSeconds}s`);
}


export function delCache(key: string): void {
  cache.del(key);
}

export function delCachePattern(pattern: string): void {
  const keys = cache.keys().filter((k) => k.startsWith(pattern));
  cache.del(keys);
}

export function flushCache(): void {
  cache.flushAll();
}
