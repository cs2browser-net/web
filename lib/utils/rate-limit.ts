import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/db/prisma";

interface RateLimitConfig {
    windowSeconds: number;
    maxCount: number;
}

interface RateLimitData {
    count: number;
    windowStart: Date;
}

interface CacheEntry {
    data: RateLimitData;
    timestamp: number;
}

class RateLimitCache {
    private cache: Map<string, CacheEntry>;
    private ttl: number;

    constructor(ttl: number = 5000) {
        this.cache = new Map();
        this.ttl = ttl;
    }

    get(key: string): RateLimitData | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        const now = Date.now();
        const isExpired = (now - entry.timestamp) >= this.ttl;

        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    set(key: string, data: RateLimitData): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    invalidate(key: string): boolean {
        return this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    get size(): number {
        return this.cache.size;
    }
}

const rateLimitCache = new RateLimitCache(5000);

export async function checkRateLimit(
    ip: string,
    kind: string,
    config: RateLimitConfig
): Promise<void> {
    const now = new Date();
    const cacheKey = `${ip}:${kind}`;
    const cached = rateLimitCache.get(cacheKey);

    if (cached) {
        if (cached.count >= config.maxCount) {
            const timeRemaining = Math.ceil(
                (cached.windowStart.getTime() + config.windowSeconds * 1000 - now.getTime()) / 1000
            );
            throw new TRPCError({
                code: 'TOO_MANY_REQUESTS',
                message: `Rate limit exceeded. Please try again in ${timeRemaining} seconds.`
            });
        }

        const updatedData = {
            count: cached.count + 1,
            windowStart: cached.windowStart
        };
        rateLimitCache.set(cacheKey, updatedData);

        updateRateLimitDb(ip, kind, updatedData.count, cached.windowStart, now).catch(console.error);

        return;
    }

    const windowStart = new Date(now.getTime() - config.windowSeconds * 1000);

    const rateLimit = await prisma.rateLimit.findFirst({
        where: {
            IP: ip,
            Kind: kind,
            WindowStart: {
                gte: windowStart
            }
        },
        orderBy: {
            WindowStart: 'desc'
        }
    });

    if (rateLimit) {
        if (rateLimit.Count >= config.maxCount) {
            const timeRemaining = Math.ceil(
                (rateLimit.WindowStart.getTime() + config.windowSeconds * 1000 - now.getTime()) / 1000
            );

            rateLimitCache.set(cacheKey, {
                count: rateLimit.Count,
                windowStart: rateLimit.WindowStart
            });

            throw new TRPCError({
                code: 'TOO_MANY_REQUESTS',
                message: `Rate limit exceeded. Please try again in ${timeRemaining} seconds.`
            });
        }

        const newCount = rateLimit.Count + 1;

        rateLimitCache.set(cacheKey, {
            count: newCount,
            windowStart: rateLimit.WindowStart
        });

        await prisma.rateLimit.update({
            where: {
                ID: rateLimit.ID
            },
            data: {
                Count: newCount,
                LastSeen: now
            }
        });
    } else {
        await prisma.rateLimit.create({
            data: {
                IP: ip,
                Kind: kind,
                Count: 1,
                LastSeen: now,
                WindowStart: now
            }
        });

        rateLimitCache.set(cacheKey, {
            count: 1,
            windowStart: now
        });
    }
}

async function updateRateLimitDb(
    ip: string,
    kind: string,
    count: number,
    windowStart: Date,
    lastSeen: Date
): Promise<void> {
    const rateLimit = await prisma.rateLimit.findFirst({
        where: {
            IP: ip,
            Kind: kind,
            WindowStart: windowStart
        }
    });

    if (rateLimit) {
        await prisma.rateLimit.update({
            where: {
                ID: rateLimit.ID
            },
            data: {
                Count: count,
                LastSeen: lastSeen
            }
        });
    }
}
