import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import { queryCache } from "@/lib/cache/query-cache";
import { MetricsCacheTTL } from "@/lib/consts/metrics";
import { db } from "@/lib/db/drizzle";
import { metrics, server } from "@/generated/drizzle/schema";
import { and, count, eq, gte, isNotNull, notInArray } from "drizzle-orm";

export const metricsRouter = router({
    fetchMetrics: publicProcedure.input(
        z.object({
            mode: z.enum(['24h', '7d', '30d'])
        })
    ).query(async (data) => {
        const { mode } = data.input;

        const mtcs = await queryCache.query(
            'metrics:all',
            async () => {
                const rows = await db.select().from(metrics);
                return rows.length > 0 ? rows[0] : null;
            },
            MetricsCacheTTL
        );

        const filteredServers = await queryCache.query(
            `metrics:filtered`,
            async () => {
                const cnt = await db.select({ count: count() }).from(server).where(
                    and(
                        isNotNull(server.lastUpdated),
                        gte(server.status, 2),
                        notInArray(server.status, [5, 9])
                    )
                );

                return cnt[0].count;
            },
            MetricsCacheTTL
        );

        if (!mtcs) throw new Error("Metrics not found");

        if (mode == '24h') {
            return {
                players: mtcs.playersLast24Hours,
                checked: mtcs.checkedLast24Hours,
                prefiltered: mtcs.prefilterLast24Hours,
                filteredServers
            }
        } else if (mode == '7d') {
            return {
                players: mtcs.playersLast7Days,
                checked: mtcs.checkedLast7Days,
                prefiltered: mtcs.prefilterLast7Days,
                filteredServers
            }
        } else if (mode == '30d') {
            return {
                players: mtcs.playersLast30Days,
                checked: mtcs.checkedLast30Days,
                prefiltered: mtcs.prefilterLast30Days,
                filteredServers
            }
        }

        throw new Error("Invalid mode");
    })
});