import { ServersPerPage, ServersQueryCacheTTL } from "@/lib/consts/servers";
import { prisma } from "@/lib/db/prisma";
import { publicProcedure, router } from "@/lib/trpc/trpc";
import { GetLocation } from "@/lib/utils/ip";
import { queryCache } from "@/lib/cache/query-cache";
import { z } from 'zod'
import { EstimatePing } from "@/lib/location/ping";
import { countryToContinent } from "@/lib/location/mappings";
import { GetServersByGamemode } from "@/lib/filters/gamemodes";

export const serversRouter = router({
    fetchServersWithId: publicProcedure.input(
        z.object({
            serverIds: z.array(z.string())
        })
    ).query(async (data) => {
        const servers = await queryCache.query(
            'servers:all',
            async () => {
                return await prisma.serverData.findMany({
                    where: {
                        server: {
                            Status: 0,
                            LastUpdated: {
                                not: null
                            }
                        }
                    },
                    include: {
                        server: true
                    }
                });
            },
            ServersQueryCacheTTL
        );

        const filteredServers = servers.filter((server) => data.input.serverIds.includes(server.ServerID));

        return filteredServers;
    }),
    fetchServer: publicProcedure.input(
        z.object({
            serverId: z.string()
        })
    ).query(async (data) => {
        const server = await queryCache.query(
            `servers:${data.input.serverId}`,
            async () => {
                return await prisma.server.findFirst({
                    where: {
                        ID: data.input.serverId,
                        Status: 0,
                        LastUpdated: {
                            not: null
                        }
                    },
                    include: {
                        serverData: true,
                        playersData: true
                    }
                });
            },
            ServersQueryCacheTTL
        );

        return server;
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
                return await prisma.serverData.findMany({
                    where: {
                        server: {
                            Status: 0,
                            LastUpdated: {
                                not: null
                            }
                        }
                    },
                    include: {
                        server: true
                    }
                });
            },
            ServersQueryCacheTTL
        );

        const clientLocation = GetLocation(data.ctx.ip);

        if (data.input.gamemode !== undefined && data.input.gamemode !== "") {
            servers = GetServersByGamemode(servers, data.input.gamemode);
        }

        let filteredServers = servers.filter((server) => {
            if (data.input.hiddenServers.includes(server.ServerID)) return false;
            if (server.Hostname.toLowerCase().includes("cs2inspects.com")) return false;

            /** Filters Section */
            if (data.input.hideEmptyServers && server.PlayersCount == 0) return false;
            if (!data.input.showFullServers && server.PlayersCount >= server.MaxPlayers) return false;

            if (data.input.showPings.length > 0 || data.input.hidePings.length > 0) {
                const serverPing = EstimatePing(server.server!.Latitute, server.server!.Longitude, clientLocation.latitude, clientLocation.longitude);
                for (const showPing of data.input.showPings) {
                    if (serverPing > showPing) return false;
                }
                for (const hidePing of data.input.hidePings) {
                    if (serverPing <= hidePing) return false;
                }
            }

            if (data.input.showMaps.length > 0 || data.input.hideMaps.length > 0) {
                const map = server.Map;

                if (data.input.showMaps.length > 0 && !data.input.showMaps.includes(map)) return false;
                if (data.input.hideMaps.length > 0 && data.input.hideMaps.includes(map)) return false;
            }

            if (data.input.showVersions.length > 0 || data.input.hideVersions.length > 0) {
                const version = server.Version;

                if (data.input.showVersions.length > 0 && !data.input.showVersions.includes(version)) return false;
                if (data.input.hideVersions.length > 0 && data.input.hideVersions.includes(version)) return false;
            }

            if (data.input.showContinents.length > 0 || data.input.hideContinents.length > 0) {
                const country = server.server!.Country;
                const continent = countryToContinent[country.toLowerCase()];

                if (data.input.showContinents.length > 0 && !data.input.showContinents.includes(continent)) return false;
                if (data.input.hideContinents.length > 0 && data.input.hideContinents.includes(continent)) return false;
            }

            if (data.input.showCountries.length > 0 || data.input.hideCountries.length > 0) {
                const country = server.server!.Country;

                if (data.input.showCountries.length > 0 && !data.input.showCountries.includes(country)) return false;
                if (data.input.hideCountries.length > 0 && data.input.hideCountries.includes(country)) return false;
            }

            /** Search Bar Filtering */
            if (data.input.searchBarQuery) {
                const searchValue = data.input.searchBarQuery;

                if (searchValue.includes('(?=') || searchValue.includes('(?!')) {
                    try {
                        const rx = new RegExp(searchValue, "i");
                        const combinedText = `${server.Hostname} ${server.Tags} ${server.server!.Address}`;
                        return rx.test(combinedText);
                    } catch (error) {
                        const searchTerm = searchValue.toLowerCase();
                        const hostname = server.Hostname.toLowerCase();
                        const tags = server.Tags.toLowerCase();
                        const address = server.server!.Address.toLowerCase();
                        return hostname.includes(searchTerm) || tags.includes(searchTerm) || address.includes(searchTerm);
                    }
                } else {
                    try {
                        const rx = new RegExp(searchValue, "i");
                        const hostname = server.Hostname;
                        const tags = server.Tags;
                        const address = server.server!.Address;

                        return rx.test(hostname) || rx.test(tags) || rx.test(address);
                    } catch (error) {
                        const searchTerm = searchValue.toLowerCase();
                        const hostname = server.Hostname.toLowerCase();
                        const tags = server.Tags.toLowerCase();
                        const address = server.server!.Address.toLowerCase();
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
                    const playerCountA = serverA.PlayersCount - serverA.BotsCount;
                    const playerCountB = serverB.PlayersCount - serverB.BotsCount;

                    if (data.input.sort.players == 'asc') {
                        result += playerCountA - playerCountB;
                    } else {
                        result += playerCountB - playerCountA;
                    }
                }

                if (data.input.sort.ping && data.input.sort.ping !== 'none') {
                    const pingA = EstimatePing(serverA.server!.Latitute, serverA.server!.Longitude, clientLocation.latitude, clientLocation.longitude);
                    const pingB = EstimatePing(serverB.server!.Latitute, serverB.server!.Longitude, clientLocation.latitude, clientLocation.longitude);

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
                const playerCountA = serverA.PlayersCount - serverA.BotsCount;
                const playerCountB = serverB.PlayersCount - serverB.BotsCount;

                const pingA = EstimatePing(serverA.server!.Latitute, serverA.server!.Longitude, clientLocation.latitude, clientLocation.longitude);
                const pingB = EstimatePing(serverB.server!.Latitute, serverB.server!.Longitude, clientLocation.latitude, clientLocation.longitude);

                if (playerCountA == 0 && playerCountB == 0) return pingA - pingB;
                else return playerCountB - playerCountA;
            });
        } else {
            filteredServers = filteredServers.sort((serverA, serverB) => {
                const playerCountA = serverA.PlayersCount - serverA.BotsCount;
                const playerCountB = serverB.PlayersCount - serverB.BotsCount;

                const pingA = EstimatePing(serverA.server!.Latitute, serverA.server!.Longitude, clientLocation.latitude, clientLocation.longitude);
                const pingB = EstimatePing(serverB.server!.Latitute, serverB.server!.Longitude, clientLocation.latitude, clientLocation.longitude);

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
