interface BannerCacheEntry {
    buffer: Buffer;
    timestamp: number;
}

class BannerCache {
    private cache: Map<string, BannerCacheEntry>;
    private pending: Map<string, Promise<Buffer>>;
    private readonly defaultTTL: number = 30000;

    constructor() {
        this.cache = new Map();
        this.pending = new Map();
    }

    private isExpired(entry: BannerCacheEntry, ttl: number): boolean {
        const now = Date.now();
        return (now - entry.timestamp) >= ttl;
    }

    get(key: string, ttl: number = this.defaultTTL): Buffer | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        if (this.isExpired(entry, ttl)) {
            this.cache.delete(key);
            return null;
        }

        return entry.buffer;
    }

    set(key: string, buffer: Buffer): void {
        this.cache.set(key, {
            buffer,
            timestamp: Date.now()
        });
    }

    async generateOrGet(
        key: string,
        generateFn: () => Buffer | Promise<Buffer>,
        ttl: number = this.defaultTTL
    ): Promise<Buffer> {
        const cached = this.get(key, ttl);
        if (cached !== null) {
            return cached;
        }

        const existingPromise = this.pending.get(key);
        if (existingPromise) {
            return existingPromise;
        }

        const promise = (async () => {
            try {
                const result = await Promise.resolve(generateFn());
                this.set(key, result);
                return result;
            } finally {
                this.pending.delete(key);
            }
        })();

        this.pending.set(key, promise);
        return promise;
    }

    invalidate(key: string): boolean {
        this.pending.delete(key);
        return this.cache.delete(key);
    }

    invalidatePattern(pattern: RegExp): number {
        let count = 0;
        for (const key of this.cache.keys()) {
            if (pattern.test(key)) {
                this.pending.delete(key);
                this.cache.delete(key);
                count++;
            }
        }
        return count;
    }

    invalidateServer(serverId: string): number {
        return this.invalidatePattern(new RegExp(`^banner:${serverId}:`));
    }

    clear(): void {
        this.pending.clear();
        this.cache.clear();
    }

    get size(): number {
        return this.cache.size;
    }

    get pendingCount(): number {
        return this.pending.size;
    }
}

export const bannerCache = new BannerCache();
