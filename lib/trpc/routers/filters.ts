import { queryCache } from "@/lib/cache/query-cache";
import { publicProcedure, router } from "../trpc";
import { ServersQueryCacheTTL } from "@/lib/consts/servers";
import { getName } from 'country-list'
import { continentNames, countryToContinent } from "@/lib/location/mappings";
import { db } from "@/lib/db/drizzle";
import { server, serverData } from "@/generated/drizzle/schema";
import { and, count, desc, eq, isNotNull } from "drizzle-orm";

export const filtersRouter = router({
    getFilters: publicProcedure.query(async (data) => {
        const countryRows = await queryCache.query(
            'countries:count',
            async () => {
                const groups = await db.select({
                    country: server.country,
                    countryCount: count(server.country)
                }).from(server)
                    .where(
                        and(
                            eq(server.status, 0),
                            isNotNull(server.lastUpdated)
                        )
                    ).groupBy(server.country)
                    .orderBy(desc(count(server.country)));

                return groups;
            },
            ServersQueryCacheTTL
        );

        const versionRows = await queryCache.query(
            'versions:count',
            async () => {
                const groups = await db.select({
                    version: serverData.version,
                    versionCount: count(serverData.version)
                }).from(serverData)
                    .leftJoin(server, eq(server.id, serverData.serverId))
                    .where(
                        and(
                            eq(server.status, 0),
                            isNotNull(server.lastUpdated)
                        )
                    ).groupBy(serverData.version)
                    .orderBy(desc(count(serverData.version)));

                return groups;
            },
            ServersQueryCacheTTL
        );

        const mapRows = await queryCache.query(
            'maps:count',
            async () => {
                const groups = await db.select({
                    map: serverData.map,
                    mapCount: count(serverData.map)
                }).from(serverData)
                    .leftJoin(server, eq(server.id, serverData.serverId))
                    .where(
                        and(
                            eq(server.status, 0),
                            isNotNull(server.lastUpdated)
                        )
                    ).groupBy(serverData.map)
                    .orderBy(desc(count(serverData.map)));

                return groups;
            },
            ServersQueryCacheTTL
        );

        const countries: Record<string, any> = {}
        const continentCounts: Record<string, number> = {}

        for (const country of countryRows) {
            const countryName = getName(country.country);
            const continent = countryToContinent[country.country.toLowerCase()];

            countries[country.country] = {
                name: `${countryName} (${country.countryCount})`,
                count: country.countryCount,
                continent: continent
            };

            if (continent) {
                continentCounts[continent] = (continentCounts[continent] || 0) + country.countryCount;
            }
        }

        const continents: Record<string, any> = {}
        for (const [continentCode, count] of Object.entries(continentCounts)) {
            continents[continentCode] = `${continentNames[continentCode] || continentCode} (${count})`;
        }

        const maps: Record<string, any> = {}
        for (const map of mapRows) maps[map.map] = `${map.map} (${map.mapCount})`;

        const versions: Record<string, any> = {}
        for (const version of versionRows) versions[version.version] = `${version.version} (${version.versionCount})`;

        return {
            continents,
            countries,
            maps,
            versions
        }
    })
});
