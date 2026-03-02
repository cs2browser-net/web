import { create } from "zustand";

export interface FilterState {
    serverName: string;
    continents: {
        show: string[];
        hide: string[];
    };
    countries: {
        show: string[];
        hide: string[];
    };
    maps: {
        show: string[];
        hide: string[];
    };
    versions: {
        show: string[];
        hide: string[];
    };
    pings: {
        show: number[];
        hide: number[];
    };
    showFullServers: boolean;
    hideEmptyServers: boolean;
}

export interface FilterData {
    continents: Record<string, any>;
    countries: Record<string, any>;
    maps: Record<string, any>;
    versions: Record<string, any>;
}

export interface SortingState {
    ping: 'asc' | 'desc' | 'none';
    players: 'asc' | 'desc' | 'none';
}

interface FiltersState {
    filters: FilterState;
    filtersData: FilterData;
    sortingState: SortingState;
    setFilters: (filters: FilterState) => void;
    setFiltersData: (filtersData: FilterData) => void;
    setSortingState: (sortingState: SortingState) => void;
}

export const useFiltersStore = create<FiltersState>((set) => ({
    filters: {
        continents: {
            show: [],
            hide: []
        },
        countries: {
            show: [],
            hide: []
        },
        maps: {
            show: [],
            hide: []
        },
        versions: {
            show: [],
            hide: []
        },
        pings: {
            show: [],
            hide: []
        },
        showFullServers: true,
        hideEmptyServers: false,
        serverName: ""
    },
    filtersData: {
        continents: {},
        countries: {},
        maps: {},
        versions: {}
    },
    sortingState: {
        ping: 'none',
        players: 'none'
    },
    setFiltersData: (filtersData) => set({ filtersData }),
    setFilters: (filters) => set({ filters }),
    setSortingState: (sortingState) => set({ sortingState })
}))

export const countActiveFilters = (filters: FilterState) => {
    let count = 0;
    if (filters.serverName) count++;
    count += filters.continents.show.length;
    count += filters.countries.show.length;
    count += filters.maps.show.length;
    count += filters.versions.show.length;
    count += filters.pings.show.length;
    if (!filters.showFullServers) count++;
    if (filters.hideEmptyServers) count++;
    return count;
}