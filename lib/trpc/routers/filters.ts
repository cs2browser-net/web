import { queryCache } from "@/lib/cache/query-cache";
import { publicProcedure, router } from "../trpc";
import { ServersQueryCacheTTL } from "@/lib/consts/servers";
import { getName } from 'country-list'
import { continentNames, countryToContinent } from "@/lib/location/mappings";
import { db } from "@/lib/db/drizzle";
import { server, serverData } from "@/generated/drizzle/schema";
import { and, eq, isNotNull } from "drizzle-orm";

export const filtersRouter = router({
    getFilters: publicProcedure.query(async (data) => {
        let servers = await queryCache.query(
            'servers:all',
            async () => {
                const srvs = await db.select().from(serverData)
                    .leftJoin(server, eq(server.id, serverData.serverId))
                    .where(
                        and(
                            eq(server.status, 0),
                            isNotNull(server.lastUpdated)
                        )
                    );

                return srvs
            },
            ServersQueryCacheTTL
        );

        const precomputedVersions: Record<string, number> = {};
        const precomputedMaps: Record<string, number> = {};
        const precomputedCountries: Record<string, number> = {};

        for (const srv of servers) {
            if (!precomputedVersions.hasOwnProperty(srv.ServerData.version)) precomputedVersions[srv.ServerData.version] = 0;
            precomputedVersions[srv.ServerData.version]++;

            if (!precomputedMaps.hasOwnProperty(srv.ServerData.map)) precomputedMaps[srv.ServerData.map] = 0;
            precomputedMaps[srv.ServerData.map]++;

            if (!precomputedCountries.hasOwnProperty(srv.Server!.country)) precomputedCountries[srv.Server!.country] = 0;
            precomputedCountries[srv.Server!.country]++;
        }

        const countries: Record<string, any> = {}
        const continentCounts: Record<string, number> = {}

        for (const [country, count] of Object.entries(precomputedCountries)) {
            const countryName = getName(country);
            const continent = countryToContinent[country.toLowerCase()];

            countries[country] = {
                name: `${countryName} (${count})`,
                count: count,
                continent: continent
            };

            if (continent) {
                continentCounts[continent] = (continentCounts[continent] || 0) + count;
            }
        }

        const continents: Record<string, any> = {}
        for (const [continentCode, count] of Object.entries(continentCounts)) {
            continents[continentCode] = `${continentNames[continentCode] || continentCode} (${count})`;
        }

        const maps: Record<string, any> = {}
        for (const [map, count] of Object.entries(precomputedMaps)) maps[map] = `${map} (${count})`;

        const versions: Record<string, any> = {}
        for (const [version, count] of Object.entries(precomputedVersions)) versions[version] = `${version} (${count})`;

        return {
            continents,
            countries,
            maps,
            versions
        }
    })
});
