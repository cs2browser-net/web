"use client";

import { useEffect, useState } from "react";
import SearchBox from "../serverview/SearchBox";
import ServerList from "../serverview/ServerList";
import Filters from "../serverview/Filters";
import FiltersMobile from "../serverview/FiltersMobile";
import { trpc } from "@/lib/trpc/client";
import { useFiltersStore } from "@/lib/filters/store";
import Gamemodes from "../serverview/Gamemodes";
import { useHiddenServers } from "@/lib/client-storage/hidden-servers";

export default function HomePage({ gamemode }: { gamemode?: string }) {
    const [page, setPage] = useState(1);

    const [filtersOpen, setFiltersOpen] = useState(false);
    const filters = useFiltersStore();
    const hiddenServers = useHiddenServers();

    const { data: filtersData } = trpc.filters.getFilters.useQuery();

    useEffect(() => {
        if (filtersData) {
            filters.setFiltersData(filtersData);
        }
    }, [filtersData]);

    const { data } = trpc.servers.fetchServers.useQuery({
        page: page - 1,
        searchBarQuery: filters.filters.serverName,
        showFullServers: filters.filters.showFullServers,
        hideEmptyServers: filters.filters.hideEmptyServers,
        showPings: filters.filters.pings.show,
        hidePings: filters.filters.pings.hide,
        showVersions: filters.filters.versions.show,
        hideVersions: filters.filters.versions.hide,
        showContinents: filters.filters.continents.show,
        hideContinents: filters.filters.continents.hide,
        showCountries: filters.filters.countries.show,
        hideCountries: filters.filters.countries.hide,
        showMaps: filters.filters.maps.show,
        hideMaps: filters.filters.maps.hide,
        sort: {
            players: filters.sortingState.players,
            ping: filters.sortingState.ping
        },
        gamemode,
        hiddenServers: hiddenServers.hiddenIds
    });

    return (
        <div className="w-full">
            <Gamemodes gamemode={gamemode} />
            {/* @ts-expect-error */}
            <SearchBox onToggleFilters={() => setFiltersOpen(!filtersOpen)} servers={data} />
            <div className="flex flex-row w-full mt-4">
                <div className="flex-1 transition-all duration-300 ease-in-out">
                    {/* @ts-expect-error */}
                    <ServerList servers={data} currentPage={page} onPageChange={(x) => {
                        setPage(x)

                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} pageKind={"server-list"} />
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