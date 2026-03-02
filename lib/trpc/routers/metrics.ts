import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import { queryCache } from "@/lib/cache/query-cache";
import { prisma } from "@/lib/db/prisma";
import { MetricsCacheTTL } from "@/lib/consts/metrics";

export const metricsRouter = router({
    fetchMetrics: publicProcedure.input(
        z.object({
            mode: z.enum(['24h', '7d', '30d'])
        })
    ).query(async (data) => {
        const { mode } = data.input;

        const metrics = await queryCache.query(
            'metrics:all',
            async () => {
                return await prisma.metrics.findFirst({
                    where: {
                        ID: 1
                    }
                });
            },
            MetricsCacheTTL
        );

        const filteredServers = await queryCache.query(
            `metrics:filtered`,
            async () => {
                return await prisma.server.count({
                    where: {
                        Status: {
                            gte: 2,
                            notIn: [5, 9]
                        },
                        LastUpdated: {
                            not: null
                        }
                    }
                });
            },
            MetricsCacheTTL
        );

        if (!metrics) throw new Error("Metrics not found");

        if (mode == '24h') {
            return {
                players: metrics.PlayersLast24Hours,
                checked: metrics.CheckedLast24Hours,
                prefiltered: metrics.PrefilterLast24Hours,
                filteredServers
            }
        } else if (mode == '7d') {
            return {
                players: metrics.PlayersLast7Days,
                checked: metrics.CheckedLast7Days,
                prefiltered: metrics.PrefilterLast7Days,
                filteredServers
            }
        } else if (mode == '30d') {
            return {
                players: metrics.PlayersLast30Days,
                checked: metrics.CheckedLast30Days,
                prefiltered: metrics.PrefilterLast30Days,
                filteredServers
            }
        }

        throw new Error("Invalid mode");
    })
});