import { ServersPerPage, ServersQueryCacheTTL } from "@/lib/consts/servers";
import { publicProcedure, router } from "@/lib/trpc/trpc";
import { GetLocation } from "@/lib/utils/ip";
import { queryCache } from "@/lib/cache/query-cache";
import { z } from 'zod'
import { EstimatePing } from "@/lib/location/ping";
import { countryToContinent } from "@/lib/location/mappings";
import { GetServersByGamemode } from "@/lib/filters/gamemodes";
import { playersData, server, serverData } from "@/generated/drizzle/schema";
import { db } from "@/lib/db/drizzle";
import { and, eq, isNotNull } from "drizzle-orm";

export const serversRouter = router({
    fetchServersWithId: publicProcedure.input(
        z.object({
            serverIds: z.array(z.string())
        })
    ).query(async (data) => {
        const servers = await queryCache.query(
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

        const filteredServers = servers.filter((server) => data.input.serverIds.includes(server.ServerData.serverId));

        return filteredServers;
    }),
    fetchServer: publicProcedure.input(
        z.object({
            serverId: z.string()
        })
    ).query(async (data) => {
        const srv = await queryCache.query(
            `servers:${data.input.serverId}`,
            async () => {
                var srvs = await db.select().from(server)
                    .leftJoin(serverData, eq(server.id, serverData.serverId))
                    .leftJoin(playersData, eq(server.id, playersData.serverId))
                    .where(
                        and(
                            eq(server.id, data.input.serverId),
                            eq(server.status, 0),
                            isNotNull(server.lastUpdated)
                        )
                    ).limit(1);

                if (srvs.length === 0) return null;
                return srvs[0];
            },
            ServersQueryCacheTTL
        );

        return srv;
    }),
    fetchServers: publicProcedure.input(
        z.object({
            page: z.number().min(0).default(0),
            searchBarQuery: z.string().optional(),
            showFullServers: z.boolean().default(true),
            hideEmptyServers: z.boolean().default(false),
            showPings: z.array(z.number()).transform((arr) => arr.filter((p) => p > 0 && p <= 250)).default([]),
            hidePings: z.array(z.number()).transform((arr) => arr.filter((p) => p > 0 && p <= 250)).default([]),
            showMaps: z.array(z.string()).default([]),
            hideMaps: z.array(z.string()).default([]),
            showVersions: z.array(z.string()).default([]),
            hideVersions: z.array(z.string()).default([]),
            showContinents: z.array(z.string()).default([]),
            hideContinents: z.array(z.string()).default([]),
            showCountries: z.array(z.string()).default([]),
            hideCountries: z.array(z.string()).default([]),
            sort: z.object({
                ping: z.enum(['asc', 'desc', 'none']).optional(),
                players: z.enum(['asc', 'desc', 'none']).optional(),
            }),
            gamemode: z.string().optional(),
            hiddenServers: z.array(z.string()).default([])
        })
    ).query(async (data) => {
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

        const clientLocation = await GetLocation(data.ctx.ip);

        if (data.input.gamemode !== undefined && data.input.gamemode !== "") {
            servers = GetServersByGamemode(servers, data.input.gamemode);
        }

        let filteredServers = servers.filter((server) => {
            if (data.input.hiddenServers.includes(server.ServerData.serverId)) return false;
            if (server.ServerData.hostname.toLowerCase().includes("cs2inspects.com")) return false;

            /** Filters Section */
            if (data.input.hideEmptyServers && server.ServerData.playersCount == 0) return false;
            if (!data.input.showFullServers && server.ServerData.playersCount >= server.ServerData.maxPlayers) return false;

            if (data.input.showPings.length > 0 || data.input.hidePings.length > 0) {
                const serverPing = EstimatePing(server.Server!.latitute, server.Server!.longitude, clientLocation.latitude, clientLocation.longitude);
                for (const showPing of data.input.showPings) {
                    if (serverPing > showPing) return false;
                }
                for (const hidePing of data.input.hidePings) {
                    if (serverPing <= hidePing) return false;
                }
            }

            if (data.input.showMaps.length > 0 || data.input.hideMaps.length > 0) {
                const map = server.ServerData.map;

                if (data.input.showMaps.length > 0 && !data.input.showMaps.includes(map)) return false;
                if (data.input.hideMaps.length > 0 && data.input.hideMaps.includes(map)) return false;
            }

            if (data.input.showVersions.length > 0 || data.input.hideVersions.length > 0) {
                const version = server.ServerData.version;

                if (data.input.showVersions.length > 0 && !data.input.showVersions.includes(version)) return false;
                if (data.input.hideVersions.length > 0 && data.input.hideVersions.includes(version)) return false;
            }

            if (data.input.showContinents.length > 0 || data.input.hideContinents.length > 0) {
                const country = server.Server!.country;
                const continent = countryToContinent[country.toLowerCase()];

                if (data.input.showContinents.length > 0 && !data.input.showContinents.includes(continent)) return false;
                if (data.input.hideContinents.length > 0 && data.input.hideContinents.includes(continent)) return false;
            }

            if (data.input.showCountries.length > 0 || data.input.hideCountries.length > 0) {
                const country = server.Server!.country;

                if (data.input.showCountries.length > 0 && !data.input.showCountries.includes(country)) return false;
                if (data.input.hideCountries.length > 0 && data.input.hideCountries.includes(country)) return false;
            }

            /** Search Bar Filtering */
            if (data.input.searchBarQuery) {
                const searchValue = data.input.searchBarQuery;

                if (searchValue.includes('(?=') || searchValue.includes('(?!')) {
                    try {
                        const rx = new RegExp(searchValue, "i");
                        const combinedText = `${server.ServerData.hostname} ${server.ServerData.tags} ${server.Server!.address}`;
                        return rx.test(combinedText);
                    } catch (error) {
                        const searchTerm = searchValue.toLowerCase();
                        const hostname = server.ServerData.hostname.toLowerCase();
                        const tags = server.ServerData.tags.toLowerCase();
                        const address = server.Server!.address.toLowerCase();
                        return hostname.includes(searchTerm) || tags.includes(searchTerm) || address.includes(searchTerm);
                    }
                } else {
                    try {
                        const rx = new RegExp(searchValue, "i");
                        const hostname = server.ServerData.hostname;
                        const tags = server.ServerData.tags;
                        const address = server.Server!.address;

                        return rx.test(hostname) || rx.test(tags) || rx.test(address);
                    } catch (error) {
                        const searchTerm = searchValue.toLowerCase();
                        const hostname = server.ServerData.hostname.toLowerCase();
                        const tags = server.ServerData.tags.toLowerCase();
                        const address = server.Server!.address.toLowerCase();
                        return hostname.includes(searchTerm) || tags.includes(searchTerm) || address.includes(searchTerm);
                    }
                }
            }

            return true;
        });

        if ((data.input.sort.ping && data.input.sort.ping !== 'none') || (data.input.sort.players && data.input.sort.players !== 'none')) {
            filteredServers = filteredServers.sort((serverA, serverB) => {
                let result = 0;

                if (data.input.sort.players && data.input.sort.players !== 'none') {
                    const playerCountA = serverA.ServerData.playersCount - serverA.ServerData.botsCount;
                    const playerCountB = serverB.ServerData.playersCount - serverB.ServerData.botsCount;

                    if (data.input.sort.players == 'asc') {
                        result += playerCountA - playerCountB;
                    } else {
                        result += playerCountB - playerCountA;
                    }
                }

                if (data.input.sort.ping && data.input.sort.ping !== 'none') {
                    const pingA = EstimatePing(serverA.Server!.latitute, serverA.Server!.longitude, clientLocation.latitude, clientLocation.longitude);
                    const pingB = EstimatePing(serverB.Server!.latitute, serverB.Server!.longitude, clientLocation.latitude, clientLocation.longitude);

                    if (data.input.sort.ping == 'asc') {
                        result += pingA - pingB;
                    } else {
                        result += pingB - pingA;
                    }
                }

                return result;
            })
        } else if (data.input.gamemode == "zombie-escape") {
            filteredServers = filteredServers.sort((serverA, serverB) => {
                const playerCountA = serverA.ServerData.playersCount - serverA.ServerData.botsCount;
                const playerCountB = serverB.ServerData.playersCount - serverB.ServerData.botsCount;

                const pingA = EstimatePing(serverA.Server!.latitute, serverA.Server!.longitude, clientLocation.latitude, clientLocation.longitude);
                const pingB = EstimatePing(serverB.Server!.latitute, serverB.Server!.longitude, clientLocation.latitude, clientLocation.longitude);

                if (playerCountA == 0 && playerCountB == 0) return pingA - pingB;
                else return playerCountB - playerCountA;
            });
        } else {
            filteredServers = filteredServers.sort((serverA, serverB) => {
                const playerCountA = serverA.ServerData.playersCount - serverA.ServerData.botsCount;
                const playerCountB = serverB.ServerData.playersCount - serverB.ServerData.botsCount;

                const pingA = EstimatePing(serverA.Server!.latitute, serverA.Server!.longitude, clientLocation.latitude, clientLocation.longitude);
                const pingB = EstimatePing(serverB.Server!.latitute, serverB.Server!.longitude, clientLocation.latitude, clientLocation.longitude);

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
            data.input.page * ServersPerPage,
            (data.input.page * ServersPerPage) + ServersPerPage
        );

        return {
            servers: paginatedServers,
            count,
        }
    })
});
