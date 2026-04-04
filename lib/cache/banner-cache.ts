import { cacheClient, queryCacheKey } from "./redis";

interface BannerCacheEntry {
    buffer: string;
    expiresAt: number;
}

class BannerCache {
    private readonly PENDING_TTL = 30;
    private readonly CACHE_HASH_KEY = `${queryCacheKey}:banners`;
    private readonly PENDING_KEY_PREFIX = `${queryCacheKey}:banner-pending:`;
    private readonly defaultTTL: number = 30000;

    private buildPendingKey(key: string): string {
        return `${this.PENDING_KEY_PREFIX}${key}`;
    }

    async get(key: string, ttl: number = this.defaultTTL): Promise<Buffer | null> {
        try {
            const cached = await cacheClient.hget(this.CACHE_HASH_KEY, key);

            if (!cached) {
                return null;
            }

            const entry: BannerCacheEntry = JSON.parse(cached);
            const now = Date.now();

            if (entry.expiresAt <= now) {
                await cacheClient.hdel(this.CACHE_HASH_KEY, key);
                return null;
            }

            return Buffer.from(entry.buffer, "base64");
        } catch (error) {
            console.error(`Error getting banner cache for key ${key}:`, error);
            return null;
        }
    }

    async set(key: string, buffer: Buffer, ttl: number = this.defaultTTL): Promise<void> {
        try {
            const entry: BannerCacheEntry = {
                buffer: buffer.toString("base64"),
                expiresAt: Date.now() + ttl
            };
            await cacheClient.hset(this.CACHE_HASH_KEY, key, JSON.stringify(entry));
        } catch (error) {
            console.error(`Error setting banner cache for key ${key}:`, error);
        }
    }

    private async acquirePendingLock(key: string): Promise<boolean> {
        try {
            const pendingKey = this.buildPendingKey(key);
            const result = await cacheClient.set(
                pendingKey,
                "1",
                "EX",
                this.PENDING_TTL,
                "NX"
            );
            return result === "OK";
        } catch (error) {
            console.error(`Error acquiring pending lock for key ${key}:`, error);
            return true;
        }
    }

    private async releasePendingLock(key: string): Promise<void> {
        try {
            const pendingKey = this.buildPendingKey(key);
            await cacheClient.del(pendingKey);
        } catch (error) {
            console.error(`Error releasing pending lock for key ${key}:`, error);
        }
    }

    private async waitForCache(key: string, ttl: number = this.defaultTTL, maxAttempts: number = 60): Promise<Buffer | null> {
        for (let i = 0; i < maxAttempts; i++) {
            const cached = await this.get(key, ttl);
            if (cached !== null) {
                return cached;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return null;
    }

    async generateOrGet(
        key: string,
        generateFn: () => Buffer | Promise<Buffer>,
        ttl: number = this.defaultTTL
    ): Promise<Buffer> {
        const cached = await this.get(key, ttl);
        if (cached !== null) {
            return cached;
        }

        const acquiredLock = await this.acquirePendingLock(key);

        if (!acquiredLock) {
            const result = await this.waitForCache(key, ttl);
            if (result !== null) {
                return result;
            }
        }

        try {
            const result = await Promise.resolve(generateFn());
            await this.set(key, result, ttl);
            return result;
        } finally {
            if (acquiredLock) {
                await this.releasePendingLock(key);
            }
        }
    }

    async invalidate(key: string): Promise<boolean> {
        try {
            const result = await cacheClient.hdel(this.CACHE_HASH_KEY, key);
            return result > 0;
        } catch (error) {
            console.error(`Error invalidating banner cache for key ${key}:`, error);
            return false;
        }
    }

    async invalidatePattern(pattern: RegExp): Promise<number> {
        try {
            const allEntries = await cacheClient.hgetall(this.CACHE_HASH_KEY);
            const keysToDelete: string[] = [];
            const now = Date.now();

            for (const key of Object.keys(allEntries)) {
                try {
                    const entry: BannerCacheEntry = JSON.parse(allEntries[key]);
                    if (pattern.test(key) || entry.expiresAt <= now) {
                        keysToDelete.push(key);
                    }
                } catch (e) {
                    keysToDelete.push(key);
                }
            }

            if (keysToDelete.length > 0) {
                await cacheClient.hdel(this.CACHE_HASH_KEY, ...keysToDelete);
            }

            return keysToDelete.length;
        } catch (error) {
            console.error(`Error invalidating banner cache pattern:`, error);
            return 0;
        }
    }

    invalidateServer(serverId: string): Promise<number> {
        return this.invalidatePattern(new RegExp(`^banner:${serverId}:`));
    }

    async clear(): Promise<void> {
        try {
            await cacheClient.del(this.CACHE_HASH_KEY);
        } catch (error) {
            console.error(`Error clearing banner cache:`, error);
        }
    }
}

export const bannerCache = new BannerCache();
