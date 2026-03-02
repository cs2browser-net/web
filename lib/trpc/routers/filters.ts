import { queryCache } from "@/lib/cache/query-cache";
import { publicProcedure, router } from "../trpc";
import { prisma } from "@/lib/db/prisma";
import { ServersQueryCacheTTL } from "@/lib/consts/servers";
import { getName } from 'country-list'
import { continentNames, countryToContinent } from "@/lib/location/mappings";

export const filtersRouter = router({
    getFilters: publicProcedure.query(async (data) => {
        const countryRows = await queryCache.query(
            'countries:count',
            async () => {
                return await prisma.server.groupBy({
                    by: "Country",
                    where: {
                        Status: 0,
                        LastUpdated: {
                            not: null
                        }
                    },
                    _count: {
                        Country: true
                    },
                    orderBy: {
                        _count: {
                            Country: 'desc'
                        }
                    }
                });
            },
            ServersQueryCacheTTL
        );

        const versionRows = await queryCache.query(
            'versions:count',
            async () => {
                return await prisma.serverData.groupBy({
                    by: "Version",
                    where: {
                        server: {
                            Status: 0,
                            LastUpdated: {
                                not: null
                            }
                        }
                    },
                    _count: {
                        Version: true
                    },
                    orderBy: {
                        _count: {
                            Version: 'desc'
                        }
                    }
                });
            },
            ServersQueryCacheTTL
        );

        const mapRows = await queryCache.query(
            'maps:count',
            async () => {
                return await prisma.serverData.groupBy({
                    by: "Map",
                    where: {
                        server: {
                            Status: 0,
                            LastUpdated: {
                                not: null
                            }
                        }
                    },
                    _count: {
                        Map: true
                    },
                    orderBy: {
                        _count: {
                            Map: 'desc'
                        }
                    }
                });
            },
            ServersQueryCacheTTL
        );

        const countries: Record<string, any> = {}
        const continentCounts: Record<string, number> = {}

        for (const country of countryRows) {
            const countryName = getName(country.Country);
            const continent = countryToContinent[country.Country.toLowerCase()];

            countries[country.Country] = {
                name: `${countryName} (${country._count.Country})`,
                count: country._count.Country,
                continent: continent
            };

            if (continent) {
                continentCounts[continent] = (continentCounts[continent] || 0) + country._count.Country;
            }
        }

        const continents: Record<string, any> = {}
        for (const [continentCode, count] of Object.entries(continentCounts)) {
            continents[continentCode] = `${continentNames[continentCode] || continentCode} (${count})`;
        }

        const maps: Record<string, any> = {}
        for (const map of mapRows) maps[map.Map] = `${map.Map} (${map._count.Map})`;

        const versions: Record<string, any> = {}
        for (const version of versionRows) versions[version.Version] = `${version.Version} (${version._count.Version})`;

        return {
            continents,
            countries,
            maps,
            versions
        }
    })
});
