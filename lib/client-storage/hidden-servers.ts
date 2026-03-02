"use client";

import { useEffect, useState } from "react";

const HIDDEN_SERVERS_KEY = 'hiddenServers';

export class HiddenServersManager {
    private static instance: HiddenServersManager;
    private hiddenIds: string[] = [];
    private listeners: Set<() => void> = new Set();

    private constructor() {
        if (typeof window !== 'undefined') {
            this.loadHiddenServers();
        }
    }

    public static getInstance(): HiddenServersManager {
        if (!HiddenServersManager.instance) {
            HiddenServersManager.instance = new HiddenServersManager();
        }
        return HiddenServersManager.instance;
    }

    private loadHiddenServers(): void {
        try {
            const stored = localStorage.getItem(HIDDEN_SERVERS_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                let changed = false;

                for (const id of data) {
                    if (typeof id === 'string') {
                        this.hiddenIds.push(id);
                    } else if (typeof id === 'number') {
                        this.hiddenIds.push(String(id));
                        changed = true;
                    }
                }

                if (changed) this.saveHiddenServers();
            }
        } catch (error) {
            console.error('Error loading hidden servers:', error);
            this.hiddenIds = [];
        }
    }

    private saveHiddenServers(): void {
        try {
            localStorage.setItem(HIDDEN_SERVERS_KEY, JSON.stringify(this.hiddenIds));
            this.notifyListeners();
        } catch (error) {
            console.error('Error saving hidden servers:', error);
        }
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => listener());
    }

    public addHidden(serverId: string): void {
        if (!this.hiddenIds.includes(serverId)) {
            this.hiddenIds.unshift(serverId);
            this.saveHiddenServers();
        }
    }

    public removeHidden(serverId: string): void {
        this.hiddenIds = this.hiddenIds.filter(id => id !== serverId);
        this.saveHiddenServers();
    }

    public isHidden(serverId: string): boolean {
        return this.hiddenIds.includes(serverId);
    }

    public getHiddenIds(): string[] {
        return this.hiddenIds;
    }

    public getHiddenCount(): number {
        return this.hiddenIds.length;
    }

    public clearAllHidden(): void {
        this.hiddenIds = [];
        this.saveHiddenServers();
    }

    public toggleHidden(serverId: string): boolean {
        const isHidden = this.isHidden(serverId);
        if (isHidden) {
            this.removeHidden(serverId);
        } else {
            this.addHidden(serverId);
        }
        return !isHidden;
    }

    public subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
}

export function useHiddenServers() {
    const [hiddenIds, setHiddenIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const manager = HiddenServersManager.getInstance();

    useEffect(() => {
        setHiddenIds(manager.getHiddenIds());
        setIsLoading(false);

        const unsubscribe = manager.subscribe(() => {
            setHiddenIds(manager.getHiddenIds());
        });

        return unsubscribe;
    }, []);

    const toggleHidden = (serverId: string) => {
        return manager.toggleHidden(serverId);
    };

    const isHidden = (serverId: string) => {
        const manager = HiddenServersManager.getInstance();
        return manager.isHidden(serverId);
    };

    const clearAll = () => {
        const manager = HiddenServersManager.getInstance();
        manager.clearAllHidden();
    };

    return {
        hiddenIds,
        isLoading,
        toggleHidden,
        isHidden,
        clearAll,
        count: hiddenIds.length
    };
}
