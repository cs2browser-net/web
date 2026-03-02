"use client";

import { useEffect, useState } from "react";

const FAVOURITE_SERVERS_KEY = 'cs2browser-favorites';

export class FavouriteServerManager {
    private static instance: FavouriteServerManager;
    private favouriteIds: string[] = [];
    private listeners: Set<() => void> = new Set();

    private constructor() {
        if (typeof window !== 'undefined') {
            this.loadFavouriteServers();
        }
    }

    public static getInstance(): FavouriteServerManager {
        if (!FavouriteServerManager.instance) {
            FavouriteServerManager.instance = new FavouriteServerManager();
        }
        return FavouriteServerManager.instance;
    }

    private loadFavouriteServers(): void {
        try {
            const stored = localStorage.getItem(FAVOURITE_SERVERS_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                let changed = false;

                for (const id of data) {
                    if (typeof id === 'string') {
                        this.favouriteIds.push(id);
                    } else if (typeof id === 'number') {
                        this.favouriteIds.push(String(id));
                        changed = true;
                    }
                }

                if (changed) this.saveFavouriteServers();
            }
        } catch (error) {
            console.error('Error loading favourite servers:', error);
            this.favouriteIds = [];
        }
    }

    private saveFavouriteServers(): void {
        try {
            localStorage.setItem(FAVOURITE_SERVERS_KEY, JSON.stringify(this.favouriteIds));
            this.notifyListeners();
        } catch (error) {
            console.error('Error saving favourite servers:', error);
        }
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => listener());
    }

    public addFavourite(serverId: string): void {
        if (!this.favouriteIds.includes(serverId)) {
            this.favouriteIds.unshift(serverId);
            this.saveFavouriteServers();
        }
    }

    public removeFavourite(serverId: string): void {
        this.favouriteIds = this.favouriteIds.filter(id => id !== serverId);
        this.saveFavouriteServers();
    }

    public isFavourite(serverId: string): boolean {
        return this.favouriteIds.includes(serverId);
    }

    public getFavouriteIds(): string[] {
        return this.favouriteIds;
    }

    public getFavouriteCount(): number {
        return this.favouriteIds.length;
    }

    public clearAllFavourites(): void {
        this.favouriteIds = [];
        this.saveFavouriteServers();
    }

    public toggleFavourite(serverId: string): boolean {
        const isFavourite = this.isFavourite(serverId);
        if (isFavourite) {
            this.removeFavourite(serverId);
        } else {
            this.addFavourite(serverId);
        }
        return !isFavourite;
    }

    public subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
}

export function useFavouriteServers() {
    const [favouriteIds, setFavouriteIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const manager = FavouriteServerManager.getInstance();

    useEffect(() => {
        setFavouriteIds(manager.getFavouriteIds());
        setIsLoading(false);

        const unsubscribe = manager.subscribe(() => {
            setFavouriteIds(manager.getFavouriteIds());
        });

        return unsubscribe;
    }, []);

    const toggleFavourite = (serverId: string) => {
        return manager.toggleFavourite(serverId);
    };

    const isFavourite = (serverId: string) => {
        return manager.isFavourite(serverId);
    };

    const clearAll = () => manager.clearAllFavourites();

    return {
        favouriteIds,
        isLoading,
        toggleFavourite,
        isFavourite,
        clearAll,
        count: favouriteIds.length
    };
}
