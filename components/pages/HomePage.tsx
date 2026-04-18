"use client";

import { useEffect, useMemo, useState } from "react";
import SearchBox from "../serverview/SearchBox";
import ServerList from "../serverview/ServerList";
import Filters from "../serverview/Filters";
import FiltersMobile from "../serverview/FiltersMobile";
import { trpc } from "@/lib/trpc/client";
import { useFiltersStore } from "@/lib/filters/store";
import Gamemodes from "../serverview/Gamemodes";
import { useHiddenServers } from "@/lib/client-storage/hidden-servers";
import { useLocationStore } from "@/lib/location/store";
import { filterAndPaginateServers, precomputeFiltersData } from "@/lib/filters/servers";
import { DecompressServerList } from "@/lib/utils/compressor/client";

export default function HomePage({ gamemode }: { gamemode?: string }) {
    const [page, setPage] = useState(1);

    const [filtersOpen, setFiltersOpen] = useState(false);
    const filters = useFiltersStore();
    const hiddenServers = useHiddenServers();
    const location = useLocationStore((state) => state.location);

    useEffect(() => {
        setPage(1);
    }, [filters.filters, filters.sortingState, gamemode]);

    const { data: allServers } = trpc.servers.fetchAllServers.useQuery();

    const decompressedServers = useMemo(() => {
        if (!allServers) return undefined;

        try {
            return DecompressServerList(allServers);
        } catch (error) {
            console.error("Failed to decompress server list", error);
            return undefined;
        }
    }, [allServers]);

    const computedFiltersData = useMemo(() => {
        if (!decompressedServers) return undefined;
        return precomputeFiltersData(decompressedServers);
    }, [decompressedServers]);

    useEffect(() => {
        if (computedFiltersData) {
            filters.setFiltersData(computedFiltersData);
        }
    }, [computedFiltersData]);

    const data = useMemo(() => {
        if (!decompressedServers || !location) return undefined;

        return filterAndPaginateServers({
            servers: decompressedServers,
            page: page - 1,
            filters: filters.filters,
            sorting: filters.sortingState,
            gamemode,
            hiddenServers: hiddenServers.hiddenIds,
            location,
        });
    }, [decompressedServers, page, filters.filters, filters.sortingState, gamemode, hiddenServers.hiddenIds, location]);

    const isComputingPings = !!decompressedServers && !location;
    const loadingTitle = isComputingPings ? "Computing pings..." : undefined;
    const loadingDescription = isComputingPings
        ? "Please wait while we estimate ping values for your location."
        : undefined;

    return (
        <div className="w-full">
            <Gamemodes gamemode={gamemode} />
            <SearchBox onToggleFilters={() => setFiltersOpen(!filtersOpen)} servers={data} />
            <div className="flex flex-row w-full mt-4">
                <div className="flex-1 transition-all duration-300 ease-in-out">
                    <ServerList servers={data} currentPage={page} onPageChange={(x) => {
                        setPage(x)

                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} pageKind={"server-list"} loadingTitle={loadingTitle} loadingDescription={loadingDescription} />
                </div>
                <div className="hidden md:block">
                    <Filters isOpen={filtersOpen} />
                </div>
            </div>
            <div className="md:hidden">
                <FiltersMobile isOpen={filtersOpen} onClose={() => setFiltersOpen(false)} />
            </div>
        </div>
    )
}