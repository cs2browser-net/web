import { ServerAndServerData } from "@/lib/api/data";
import { ServersPerPage } from "@/lib/consts/servers";
import { GetServersByGamemode } from "@/lib/filters/gamemodes";
import { FilterData, FilterState, SortingState } from "@/lib/filters/store";
import { continentNames, countryToContinent } from "@/lib/location/mappings";
import { EstimatePing } from "@/lib/location/ping";
import { Location } from "@/lib/location/store";
import { getName } from "country-list";

interface FilterAndPaginateServersInput {
    servers: ServerAndServerData[];
    page: number;
    filters: FilterState;
    sorting: SortingState;
    gamemode?: string;
    hiddenServers: string[];
    location?: Location;
}

interface FilterAndPaginateServersResult {
    servers: ServerAndServerData[];
    count: number;
}

const normalizePings = (pings: number[]) => pings.filter((p) => p > 0 && p <= 250);

export function precomputeFiltersData(servers: ServerAndServerData[]): FilterData {
    const precomputedVersions: Record<string, number> = {};
    const precomputedMaps: Record<string, number> = {};
    const precomputedCountries: Record<string, number> = {};

    for (const srv of servers) {
        const version = srv.ServerData.version;
        if (version) {
            precomputedVersions[version] = (precomputedVersions[version] || 0) + 1;
        }

        const map = srv.ServerData.map;
        if (map) {
            precomputedMaps[map] = (precomputedMaps[map] || 0) + 1;
        }

        const country = srv.Server.country;
        if (country) {
            precomputedCountries[country] = (precomputedCountries[country] || 0) + 1;
        }
    }

    const countries: Record<string, any> = {};
    const continentCounts: Record<string, number> = {};

    for (const [country, count] of Object.entries(precomputedCountries)) {
        const countryName = getName(country) || country;
        const continent = countryToContinent[country.toLowerCase()] || "";

        countries[country] = {
            name: `${countryName} (${count})`,
            count,
            continent,
        };

        if (continent) {
            continentCounts[continent] = (continentCounts[continent] || 0) + count;
        }
    }

    const continents: Record<string, any> = {};
    for (const [continentCode, count] of Object.entries(continentCounts)) {
        continents[continentCode] = `${continentNames[continentCode] || continentCode} (${count})`;
    }

    const maps: Record<string, any> = {};
    for (const [map, count] of Object.entries(precomputedMaps)) {
        maps[map] = `${map} (${count})`;
    }

    const versions: Record<string, any> = {};
    for (const [version, count] of Object.entries(precomputedVersions)) {
        versions[version] = `${version} (${count})`;
    }

    return {
        continents,
        countries,
        maps,
        versions,
    };
}

export function filterAndPaginateServers({
    servers,
    page,
    filters,
    sorting,
    gamemode,
    hiddenServers,
    location,
}: FilterAndPaginateServersInput): FilterAndPaginateServersResult {
    let currentServers = servers;

    const showPings = normalizePings(filters.pings.show);
    const hidePings = normalizePings(filters.pings.hide);

    const hiddenServersSet = hiddenServers.length > 0 ? new Set(hiddenServers) : null;
    const showMapsSet = filters.maps.show.length > 0 ? new Set(filters.maps.show) : null;
    const hideMapsSet = filters.maps.hide.length > 0 ? new Set(filters.maps.hide) : null;
    const showVersionsSet = filters.versions.show.length > 0 ? new Set(filters.versions.show) : null;
    const hideVersionsSet = filters.versions.hide.length > 0 ? new Set(filters.versions.hide) : null;
    const showContinentsSet = filters.continents.show.length > 0 ? new Set(filters.continents.show) : null;
    const hideContinentsSet = filters.continents.hide.length > 0 ? new Set(filters.continents.hide) : null;
    const showCountriesSet = filters.countries.show.length > 0 ? new Set(filters.countries.show) : null;
    const hideCountriesSet = filters.countries.hide.length > 0 ? new Set(filters.countries.hide) : null;

    let searchRegex: RegExp | null = null;
    let searchTermLower: string | null = null;
    if (filters.serverName) {
        try {
            searchRegex = new RegExp(filters.serverName, "i");
        } catch {
            searchTermLower = filters.serverName.toLowerCase();
        }
    }

    if (gamemode !== undefined && gamemode !== "") {
        currentServers = GetServersByGamemode(currentServers, gamemode) as ServerAndServerData[];
    }

    let filteredServers = currentServers.filter((server) => {
        if (hiddenServersSet?.has(server.ServerData.serverId)) return false;
        const hostnameLower = server.ServerData.hostname.toLowerCase();
        if (hostnameLower.includes("cs2inspect") || hostnameLower.includes("cs2 inspect") || hostnameLower.includes("inspect cs2") || hostnameLower.includes("inspectcs2")) return false;

        if (filters.hideEmptyServers && server.ServerData.playersCount == 0) return false;
        if (!filters.showFullServers && server.ServerData.playersCount >= server.ServerData.maxPlayers) return false;

        if (showPings.length > 0 || hidePings.length > 0) {
            const serverPing = EstimatePing(server.Server.latitute, server.Server.longitude, location?.latitude, location?.longitude);
            for (const showPing of showPings) {
                if (serverPing > showPing) return false;
            }
            for (const hidePing of hidePings) {
                if (serverPing <= hidePing) return false;
            }
        }

        if (showMapsSet || hideMapsSet) {
            const map = server.ServerData.map;

            if (showMapsSet && !showMapsSet.has(map)) return false;
            if (hideMapsSet && hideMapsSet.has(map)) return false;
        }

        if (showVersionsSet || hideVersionsSet) {
            const version = server.ServerData.version;

            if (showVersionsSet && !showVersionsSet.has(version)) return false;
            if (hideVersionsSet && hideVersionsSet.has(version)) return false;
        }

        if (showContinentsSet || hideContinentsSet) {
            const country = server.Server.country;
            const continent = countryToContinent[country.toLowerCase()] ?? "";

            if (showContinentsSet && !showContinentsSet.has(continent)) return false;
            if (hideContinentsSet && hideContinentsSet.has(continent)) return false;
        }

        if (showCountriesSet || hideCountriesSet) {
            const country = server.Server.country;

            if (showCountriesSet && !showCountriesSet.has(country)) return false;
            if (hideCountriesSet && hideCountriesSet.has(country)) return false;
        }

        if (searchRegex) {
            const hostname = server.ServerData.hostname;
            const tags = server.ServerData.tags;
            const address = server.Server.address;

            return searchRegex.test(hostname) || searchRegex.test(tags) || searchRegex.test(address);
        }

        if (searchTermLower !== null) {
            const hostname = server.ServerData.hostname.toLowerCase();
            const tags = server.ServerData.tags.toLowerCase();
            const address = server.Server.address.toLowerCase();

            if (!hostname.includes(searchTermLower) && !tags.includes(searchTermLower) && !address.includes(searchTermLower)) {
                return false;
            }
        }

        return true;
    });

    if ((sorting.ping && sorting.ping !== "none") || (sorting.players && sorting.players !== "none")) {
        filteredServers = filteredServers.sort((serverA, serverB) => {
            let result = 0;

            if (sorting.players && sorting.players !== "none") {
                const playerCountA = serverA.ServerData.playersCount - serverA.ServerData.botsCount;
                const playerCountB = serverB.ServerData.playersCount - serverB.ServerData.botsCount;

                if (sorting.players == "asc") {
                    result += playerCountA - playerCountB;
                } else {
                    result += playerCountB - playerCountA;
                }
            }

            if (sorting.ping && sorting.ping !== "none") {
                const pingA = EstimatePing(serverA.Server.latitute, serverA.Server.longitude, location?.latitude, location?.longitude);
                const pingB = EstimatePing(serverB.Server.latitute, serverB.Server.longitude, location?.latitude, location?.longitude);

                if (sorting.ping == "asc") {
                    result += pingA - pingB;
                } else {
                    result += pingB - pingA;
                }
            }

            return result;
        });
    } else if (gamemode == "zombie-escape") {
        filteredServers = filteredServers.sort((serverA, serverB) => {
            const playerCountA = serverA.ServerData.playersCount - serverA.ServerData.botsCount;
            const playerCountB = serverB.ServerData.playersCount - serverB.ServerData.botsCount;

            const pingA = EstimatePing(serverA.Server.latitute, serverA.Server.longitude, location?.latitude, location?.longitude);
            const pingB = EstimatePing(serverB.Server.latitute, serverB.Server.longitude, location?.latitude, location?.longitude);

            if (playerCountA == 0 && playerCountB == 0) return pingA - pingB;
            return playerCountB - playerCountA;
        });
    } else {
        filteredServers = filteredServers.sort((serverA, serverB) => {
            const playerCountA = serverA.ServerData.playersCount - serverA.ServerData.botsCount;
            const playerCountB = serverB.ServerData.playersCount - serverB.ServerData.botsCount;

            const pingA = EstimatePing(serverA.Server.latitute, serverA.Server.longitude, location?.latitude, location?.longitude);
            const pingB = EstimatePing(serverB.Server.latitute, serverB.Server.longitude, location?.latitude, location?.longitude);

            const HIGH_PING_THRESHOLD = 150;
            const MEDIUM_PING_THRESHOLD = 80;
            const LOW_PING_THRESHOLD = 40;

            if (pingA > HIGH_PING_THRESHOLD && pingB <= HIGH_PING_THRESHOLD) return 1;
            if (pingB > HIGH_PING_THRESHOLD && pingA <= HIGH_PING_THRESHOLD) return -1;

            if (playerCountA === 0 && playerCountB === 0) {
                return pingA - pingB;
            }

            if (playerCountA === 0 && playerCountB > 0) return 1;
            if (playerCountB === 0 && playerCountA > 0) return -1;

            if (pingA <= LOW_PING_THRESHOLD && pingB > MEDIUM_PING_THRESHOLD) return -1;
            if (pingB <= LOW_PING_THRESHOLD && pingA > MEDIUM_PING_THRESHOLD) return 1;

            const pingDiff = Math.abs(pingA - pingB);
            const playerDiff = playerCountB - playerCountA;

            if (pingDiff <= 20) {
                return playerDiff;
            }

            if (pingDiff <= 50) {
                const score = (pingA - pingB) * 0.4 + playerDiff * 1.5;
                return score;
            }

            return (pingA - pingB) * 0.8 + playerDiff * 0.4;
        });
    }

    const count = filteredServers.length;
    const paginatedServers = filteredServers.slice(
        page * ServersPerPage,
        (page * ServersPerPage) + ServersPerPage
    );

    return {
        servers: paginatedServers,
        count,
    };
}