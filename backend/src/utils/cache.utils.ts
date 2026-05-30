import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 }); // 5 min default TTL

export function getCache<T>(key: string): T | undefined {
  return cache.get<T>(key);
}

export function setCache<T>(key: string, value: T, ttlSeconds = 300): void {
  cache.set(key, value, ttlSeconds);
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
