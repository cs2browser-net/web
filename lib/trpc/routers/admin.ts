import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { GetLocation } from "@/lib/utils/ip";
import { db } from "@/lib/db/drizzle";
import { server, serverData, tasks } from "@/generated/drizzle/schema";
import { desc, eq, InferInsertModel } from "drizzle-orm";

export const adminRouter = router({
    verify: publicProcedure
        .input(z.object({
            password: z.string()
        }))
        .mutation(async ({ input }) => {
            const adminPassword = process.env.ADMIN_PASSWORD;

            if (!adminPassword) {
                throw new Error("Admin password not configured");
            }

            if (input.password === adminPassword) {
                return { success: true };
            }

            return { success: false };
        }),

    getAllTasks: publicProcedure
        .input(z.object({
            password: z.string()
        }))
        .query(async ({ input }) => {
            const adminPassword = process.env.ADMIN_PASSWORD;

            if (!adminPassword || input.password !== adminPassword) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Invalid admin password'
                });
            }

            const tks = await db.select().from(tasks).orderBy(desc(tasks.id)).where(eq(tasks.taskExecuted, 0));
            return tks;
        }),

    approveTask: publicProcedure
        .input(z.object({
            password: z.string(),
            taskId: z.string()
        }))
        .mutation(async ({ input }) => {
            const adminPassword = process.env.ADMIN_PASSWORD;

            if (!adminPassword || input.password !== adminPassword) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Invalid admin password'
                });
            }

            let tasksInfo = await db.select().from(tasks).where(eq(tasks.id, input.taskId)).limit(1);
            if (tasksInfo.length === 0) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Task not found'
                });
            }
            const taskInfo = tasksInfo[0];

            if (taskInfo.taskKind === 1) {
                var createdServers: InferInsertModel<typeof server>[] = [];

                for (const srv of (taskInfo.taskData as any).servers) {
                    const servers = await db.select().from(server).where(eq(server.address, srv)).limit(1);
                    const serverExists = servers.length > 0 ? servers[0] : null;

                    if (serverExists != null) {
                        if (serverExists.status == 5 || serverExists.status == 9 || serverExists.status == 0 || serverExists.status == 1)
                            continue;

                        await db.update(server).set({
                            status: 0,
                            lastUpdated: null
                        }).where(eq(server.id, serverExists.id));
                    } else {
                        var location = await GetLocation(srv.split(":")[0]);

                        createdServers.push({
                            id: crypto.randomUUID(),
                            address: srv,
                            country: location.countryCode,
                            latitute: location.latitude,
                            longitude: location.longitude,
                            status: 0,
                        })
                    }
                }

                if (createdServers.length > 0) {
                    await db.insert(server).values(createdServers);
                }
            } else if (taskInfo.taskKind == 2) {
                await db.update(server).set({
                    status: 5
                }).where(eq(server.id, (taskInfo.taskData as any).serverId));
            }

            await db.update(tasks).set({
                taskExecuted: 1
            }).where(eq(tasks.id, input.taskId));

            return { success: true };
        }),

    rejectTask: publicProcedure
        .input(z.object({
            password: z.string(),
            taskId: z.string()
        }))
        .mutation(async ({ input }) => {
            const adminPassword = process.env.ADMIN_PASSWORD;

            if (!adminPassword || input.password !== adminPassword) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Invalid admin password'
                });
            }

            await db.update(tasks).set({
                taskExecuted: 2
            }).where(eq(tasks.id, input.taskId));

            return { success: true };
        }),

    getServerByAddress: publicProcedure
        .input(z.object({
            password: z.string(),
            address: z.string()
        }))
        .query(async ({ input }) => {
            const adminPassword = process.env.ADMIN_PASSWORD;

            if (!adminPassword || input.password !== adminPassword) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Invalid admin password'
                });
            }

            const servers = await db.select().from(server).leftJoin(serverData, eq(server.id, serverData.serverId)).where(eq(server.address, input.address)).limit(1);

            return servers[0];
        }),

    recheckServer: publicProcedure
        .input(z.object({
            password: z.string(),
            serverId: z.string()
        }))
        .mutation(async ({ input }) => {
            const adminPassword = process.env.ADMIN_PASSWORD;

            if (!adminPassword || input.password !== adminPassword) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Invalid admin password'
                });
            }

            await db.update(server).set({
                status: 0,
                lastUpdated: null
            }).where(eq(server.id, input.serverId));

            return { success: true };
        }),

    hideServer: publicProcedure
        .input(z.object({
            password: z.string(),
            serverId: z.string()
        }))
        .mutation(async ({ input }) => {
            const adminPassword = process.env.ADMIN_PASSWORD;

            if (!adminPassword || input.password !== adminPassword) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Invalid admin password'
                });
            }

            await db.update(server).set({
                status: 5,
                lastUpdated: null
            }).where(eq(server.id, input.serverId));

            return { success: true };
        }),

    setServerStatus: publicProcedure
        .input(z.object({
            password: z.string(),
            serverId: z.string(),
            status: z.number().min(0).max(9)
        }))
        .mutation(async ({ input }) => {
            const adminPassword = process.env.ADMIN_PASSWORD;

            if (!adminPassword || input.password !== adminPassword) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Invalid admin password'
                });
            }

            await db.update(server).set({
                status: input.status,
                lastUpdated: null
            }).where(eq(server.id, input.serverId));

            return { success: true };
        }),
});
