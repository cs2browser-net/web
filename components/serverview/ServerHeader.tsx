"use client";

import { useFiltersStore } from "@/lib/filters/store";
import { useCallback } from "react";

export default function ServerHeader() {
    const { sortingState, setSortingState } = useFiltersStore();

    const handleSort = useCallback((state: string) => {
        if (state === 'desc') {
            return 'asc';
        } else if (state === 'asc') {
            return 'none';
        } else {
            return 'desc';
        }
    }, []);

    return (
        <div className="hidden md:block bg-gray-800/60 py-3 rounded-md">
            <div className="grid grid-cols-[3fr_1fr_1.3fr_0.2fr_1.2fr_0.6fr] gap-1 items-center text-sm text-gray-300 uppercase tracking-wide font-medium pl-10 pr-4">
                <div className="text-left">Server Name</div>
                <button
                    className={`text-center hover:text-[#00feed] transition-colors cursor-pointer flex items-center justify-center space-x-1`}
                    onClick={() => setSortingState({ ...sortingState, players: handleSort(sortingState.players) })}
                >
                    <span>Players</span>
                    {sortingState.players !== 'none' && (
                        <span className="text-[#00feed]">
                            {sortingState.players === 'desc' ? '↓' : '↑'}
                        </span>
                    )}
                    {sortingState.players === 'none' && (
                        <span className="opacity-50">⇅</span>
                    )}
                </button>
                <div className="text-center font-mono">IP Address</div>
                <div className="text-center"></div>
                <div className="text-center">Map</div>
                <button
                    className={`text-center hover:text-[#00feed] transition-colors cursor-pointer flex items-center justify-center space-x-1`}
                    onClick={() => setSortingState({ ...sortingState, ping: handleSort(sortingState.ping) })}
                >
                    <span>Ping</span>
                    {sortingState.ping !== 'none' && (
                        <span className="text-[#00feed]">
                            {sortingState.ping === 'desc' ? '↓' : '↑'}
                        </span>
                    )}
                    {sortingState.ping === 'none' && (
                        <span className="opacity-50">⇅</span>
                    )}
                </button>
            </div>
        </div>
    )
}