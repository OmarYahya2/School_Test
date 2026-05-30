"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCache = getCache;
exports.setCache = setCache;
exports.delCache = delCache;
exports.delCachePattern = delCachePattern;
exports.flushCache = flushCache;
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default({ stdTTL: 300, checkperiod: 60 }); // 5 min default TTL
function getCache(key) {
    return cache.get(key);
}
function setCache(key, value, ttlSeconds = 300) {
    cache.set(key, value, ttlSeconds);
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