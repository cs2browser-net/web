import { cacheClient, queryCacheKey } from "./redis";

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

class QueryCache {
    private readonly PENDING_TTL = 30;
    private readonly CACHE_HASH_KEY = `${queryCacheKey}:data`;
    private readonly PENDING_KEY_PREFIX = `${queryCacheKey}:pending:`;

    private buildPendingKey(key: string): string {
        return `${this.PENDING_KEY_PREFIX}${key}`;
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            const cached = await cacheClient.hget(this.CACHE_HASH_KEY, key);

            if (!cached) {
                return null;
            }

            const entry: CacheEntry<T> = JSON.parse(cached);
            const now = Date.now();

            if (entry.expiresAt <= now) {
                await cacheClient.hdel(this.CACHE_HASH_KEY, key);
                return null;
            }

            return entry.data;
        } catch (error) {
            console.error(`Error getting cache for key ${key}:`, error);
            return null;
        }
    }

    async set<T>(key: string, data: T, ttl: number = 60000): Promise<void> {
        try {
            const entry: CacheEntry<T> = {
                data,
                expiresAt: Date.now() + ttl
            };
            await cacheClient.hset(this.CACHE_HASH_KEY, key, JSON.stringify(entry));
        } catch (error) {
            console.error(`Error setting cache for key ${key}:`, error);
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

    private async waitForCache<T>(key: string, maxAttempts: number = 60): Promise<T | null> {
        for (let i = 0; i < maxAttempts; i++) {
            const cached = await this.get<T>(key);
            if (cached !== null) {
                return cached;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return null;
    }

    async query<T>(key: string, queryFn: () => Promise<T>, ttl: number = 60000): Promise<T> {
        const cached = await this.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        const acquiredLock = await this.acquirePendingLock(key);

        if (!acquiredLock) {
            const result = await this.waitForCache<T>(key);
            if (result !== null) {
                return result;
            }
        }

        try {
            const result = await queryFn();
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
            console.error(`Error invalidating cache for key ${key}:`, error);
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
                    const entry = JSON.parse(allEntries[key]);
                    if (pattern.test(key) || entry.expiresAt <= now) {
                        keysToDelete.push(key);
                    }
                } catch (e) {
                    // If entry is malformed, delete it
                    keysToDelete.push(key);
                }
            }

            if (keysToDelete.length > 0) {
                await cacheClient.hdel(this.CACHE_HASH_KEY, ...keysToDelete);
            }

            return keysToDelete.length;
        } catch (error) {
            console.error(`Error invalidating cache pattern:`, error);
            return 0;
        }
    }

    async clear(): Promise<void> {
        try {
            await cacheClient.del(this.CACHE_HASH_KEY);
        } catch (error) {
            console.error(`Error clearing cache:`, error);
        }
    }
}

export const queryCache = new QueryCache();
