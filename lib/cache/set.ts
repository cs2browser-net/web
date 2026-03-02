class InfiniteCacheSet<T> {
    private cache: Set<T>;

    constructor() {
        this.cache = new Set<T>();
    }

    add(value: T): void {
        this.cache.add(value);
    }

    has(value: T): boolean {
        return this.cache.has(value);
    }

    delete(value: T): boolean {
        return this.cache.delete(value);
    }

    clear(): void {
        this.cache.clear();
    }

    get size(): number {
        return this.cache.size;
    }

    values(): IterableIterator<T> {
        return this.cache.values();
    }

    forEach(callback: (value: T) => void): void {
        this.cache.forEach(callback);
    }
}
