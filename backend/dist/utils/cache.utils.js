"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCacheStats = getCacheStats;
exports.getCache = getCache;
exports.setCache = setCache;
exports.delCache = delCache;
exports.delCachePattern = delCachePattern;
exports.flushCache = flushCache;
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default({ stdTTL: 300, checkperiod: 60 }); // 5 min default TTL
let cacheHits = 0;
let cacheMisses = 0;
function getCacheStats() {
    return { hits: cacheHits, misses: cacheMisses };
}
function getCache(key) {
    const value = cache.get(key);
    if (value !== undefined) {
        cacheHits++;
        console.log(`[CACHE PERFORMANCE] HIT for key: "${key}" (Total Hits: ${cacheHits}, Misses: ${cacheMisses})`);
    }
    else {
        cacheMisses++;
        console.log(`[CACHE PERFORMANCE] MISS for key: "${key}" (Total Hits: ${cacheHits}, Misses: ${cacheMisses})`);
    }
    return value;
}
function setCache(key, value, ttlSeconds = 300) {
    cache.set(key, value, ttlSeconds);
    console.log(`[CACHE PERFORMANCE] SET key: "${key}" with TTL: ${ttlSeconds}s`);
}
function delCache(key) {
    cache.del(key);
}
function delCachePattern(pattern) {
    const keys = cache.keys().filter((k) => k.startsWith(pattern));
    cache.del(keys);
}
function flushCache() {
    cache.flushAll();
}
//# sourceMappingURL=cache.utils.js.map