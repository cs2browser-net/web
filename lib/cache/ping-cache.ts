const MAX_CACHE_SIZE = 163840;
const cacheMap = new Map<string, number>();

const getFromCache = (key: string): number | undefined => {
    const value = cacheMap.get(key);
    if (value !== undefined) {
        cacheMap.delete(key);
        cacheMap.set(key, value);
    }
    return value;
};

const setToCache = (key: string, value: number): void => {
    if (cacheMap.size >= MAX_CACHE_SIZE) {
        const firstKey = cacheMap.keys().next().value;
        if (firstKey !== undefined) {
            cacheMap.delete(firstKey);
        }
    }
    cacheMap.set(key, value);
};

class PingCache {
    get(serverLat: number, serverLon: number, userLat: number, userLon: number): number | undefined {
        const key = this.generateKey(serverLat, serverLon, userLat, userLon);
        return getFromCache(key);
    }

    set(serverLat: number, serverLon: number, userLat: number, userLon: number, ping: number): void {
        const key = this.generateKey(serverLat, serverLon, userLat, userLon);
        setToCache(key, ping);
    }

    private generateKey(serverLat: number, serverLon: number, userLat: number, userLon: number): string {
        return `${serverLat.toFixed(2)},${serverLon.toFixed(2)},${userLat.toFixed(2)},${userLon.toFixed(2)}`;
    }

    clear(): void {
        cacheMap.clear();
    }

    getStats() {
        return {
            size: cacheMap.size,
            maxSize: MAX_CACHE_SIZE
        };
    }
}

export const pingCache = new PingCache();
