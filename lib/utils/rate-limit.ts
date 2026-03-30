import { TRPCError } from "@trpc/server";
import { db } from "../db/drizzle";
import { rateLimit } from "@/generated/drizzle/schema";
import { and, desc, eq, gte } from "drizzle-orm";

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
    const rateLimits = await db.select().from(rateLimit).orderBy(desc(rateLimit.windowStart))
        .where(
            and(
                eq(rateLimit.ip, ip),
                eq(rateLimit.kind, kind),
                gte(rateLimit.windowStart, windowStart.toISOString())
            )
        )

    const rL = rateLimits.length > 0 ? rateLimits[0] : null;

    if (rL) {
        var windowStartDate = new Date(rL.windowStart);

        if (rL.count >= config.maxCount) {
            const timeRemaining = Math.ceil(
                (windowStartDate.getTime() + config.windowSeconds * 1000 - now.getTime()) / 1000
            );

            rateLimitCache.set(cacheKey, {
                count: rL.count,
                windowStart: windowStartDate
            });

            throw new TRPCError({
                code: 'TOO_MANY_REQUESTS',
                message: `Rate limit exceeded. Please try again in ${timeRemaining} seconds.`
            });
        }

        const newCount = rL.count + 1;

        rateLimitCache.set(cacheKey, {
            count: newCount,
            windowStart: windowStartDate
        });

        await db.update(rateLimit).set({
            count: newCount,
            lastSeen: now.toISOString()
        }).where(eq(rateLimit.id, rL.id));
    } else {
        await db.insert(rateLimit).values({
            id: crypto.randomUUID(),
            ip,
            kind,
            count: 1,
            lastSeen: now.toISOString(),
            windowStart: now.toISOString()
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
    const rateLimits = await db.select().from(rateLimit)
        .where(
            and(
                eq(rateLimit.ip, ip),
                eq(rateLimit.kind, kind),
                eq(rateLimit.windowStart, windowStart.toISOString())
            )
        );

    if (rateLimits.length > 0) {
        const rL = rateLimits[0];
        await db.update(rateLimit).set({
            count: count,
            lastSeen: lastSeen.toISOString()
        }).where(eq(rateLimit.id, rL.id));
    }
}
