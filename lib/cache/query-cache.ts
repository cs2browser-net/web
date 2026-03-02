interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

class QueryCache {
    private cache: Map<string, CacheEntry<any>>;
    private pending: Map<string, Promise<any>>;

    constructor() {
        this.cache = new Map();
        this.pending = new Map();
    }

    get<T>(key: string, ttl: number): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        const now = Date.now();
        const isExpired = (now - entry.timestamp) >= ttl;

        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    set<T>(key: string, data: T): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    async query<T>(key: string, queryFn: () => Promise<T>, ttl: number = 60000): Promise<T> {
        const cached = this.get<T>(key, ttl);
        if (cached !== null) {
            return cached;
        }

        const existingPromise = this.pending.get(key);
        if (existingPromise) {
            return existingPromise;
        }

        const promise = (async () => {
            try {
                const result = await queryFn();
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
        return this.cache.delete(key);
    }

    invalidatePattern(pattern: RegExp): number {
        let count = 0;
        for (const key of this.cache.keys()) {
            if (pattern.test(key)) {
                this.cache.delete(key);
                count++;
            }
        }
        return count;
    }

    clear(): void {
        this.cache.clear();
    }

    get size(): number {
        return this.cache.size;
    }
}

export const queryCache = new QueryCache();
