import Redis from "ioredis";

export const cacheClient = new Redis(process.env.CACHE_URL!);
export const queryCacheKey = process.env.QUERY_CACHE_KEY!;
export const bannersCacheKey = process.env.BANNERS_CACHE_KEY!;
export const ratelimitsCacheKey = process.env.RATELIMITS_CACHE_KEY!;