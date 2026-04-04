import { TRPCError } from "@trpc/server";
import { db } from "../db/drizzle";
import { rateLimit } from "@/generated/drizzle/schema";
import { and, desc, eq, gte } from "drizzle-orm";
import { cacheClient, ratelimitsCacheKey } from "@/lib/cache/redis";

interface RateLimitConfig {
    windowSeconds: number;
    maxCount: number;
}

interface RateLimitData {
    count: number;
    windowStart: Date;
}

interface RateLimitCacheEntry {
    count: number;
    windowStart: string;
    expiresAt: number;
}

class RateLimitCache {
    private readonly TTL = 5000;

    private buildField(ip: string, kind: string): string {
        return `${ip}:${kind}`;
    }

    async get(ip: string, kind: string): Promise<RateLimitData | null> {
        try {
            const field = this.buildField(ip, kind);
            const cached = await cacheClient.hget(ratelimitsCacheKey, field);

            if (!cached) {
                return null;
            }

            const entry: RateLimitCacheEntry = JSON.parse(cached);
            const now = Date.now();

            if (entry.expiresAt <= now) {
                await cacheClient.hdel(ratelimitsCacheKey, field);
                return null;
            }

            return {
                count: entry.count,
                windowStart: new Date(entry.windowStart)
            };
        } catch (error) {
            console.error(`Error getting rate limit cache for ip ${ip}, kind ${kind}:`, error);
            return null;
        }
    }

    async set(ip: string, kind: string, data: RateLimitData): Promise<void> {
        try {
            const field = this.buildField(ip, kind);
            const entry: RateLimitCacheEntry = {
                count: data.count,
                windowStart: data.windowStart.toISOString(),
                expiresAt: Date.now() + this.TTL
            };
            await cacheClient.hset(ratelimitsCacheKey, field, JSON.stringify(entry));
        } catch (error) {
            console.error(`Error setting rate limit cache for ip ${ip}, kind ${kind}:`, error);
        }
    }

    async invalidate(ip: string, kind: string): Promise<boolean> {
        try {
            const field = this.buildField(ip, kind);
            const result = await cacheClient.hdel(ratelimitsCacheKey, field);
            return result > 0;
        } catch (error) {
            console.error(`Error invalidating rate limit cache for ip ${ip}, kind ${kind}:`, error);
            return false;
        }
    }

    async invalidateByIp(ip: string): Promise<number> {
        try {
            const allEntries = await cacheClient.hgetall(ratelimitsCacheKey);
            const fieldsToDelete: string[] = [];

            for (const field of Object.keys(allEntries)) {
                if (field.startsWith(`${ip}:`)) {
                    fieldsToDelete.push(field);
                }
            }

            if (fieldsToDelete.length > 0) {
                await cacheClient.hdel(ratelimitsCacheKey, ...fieldsToDelete);
            }

            return fieldsToDelete.length;
        } catch (error) {
            console.error(`Error invalidating all rate limits for ip ${ip}:`, error);
            return 0;
        }
    }

    async clear(): Promise<void> {
        try {
            await cacheClient.del(ratelimitsCacheKey);
        } catch (error) {
            console.error(`Error clearing rate limit cache:`, error);
        }
    }
}

const rateLimitCache = new RateLimitCache();

export async function checkRateLimit(
    ip: string,
    kind: string,
    config: RateLimitConfig
): Promise<void> {
    const now = new Date();
    const cached = await rateLimitCache.get(ip, kind);

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
        await rateLimitCache.set(ip, kind, updatedData);

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

            await rateLimitCache.set(ip, kind, {
                count: rL.count,
                windowStart: windowStartDate
            });

            throw new TRPCError({
                code: 'TOO_MANY_REQUESTS',
                message: `Rate limit exceeded. Please try again in ${timeRemaining} seconds.`
            });
        }

        const newCount = rL.count + 1;

        await rateLimitCache.set(ip, kind, {
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

        await rateLimitCache.set(ip, kind, {
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
