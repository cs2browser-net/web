import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { TRPCError } from "@trpc/server";
import { GetLocation } from "@/lib/utils/ip";
import { ServerCreateInput } from "@/generated/prisma/models";

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

            const tasks = await prisma.tasks.findMany({
                where: {
                    TaskExecuted: 0
                },
                orderBy: {
                    ID: 'desc'
                }
            });

            return tasks;
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

            let taskInfo = await prisma.tasks.findFirstOrThrow({
                where: {
                    ID: input.taskId
                }
            })

            if (taskInfo.TaskKind === 1) {
                var createdServers: ServerCreateInput[] = [];

                for (const server of (taskInfo.TaskData as any).servers) {
                    var serverExists = await prisma.server.findFirst({
                        where: {
                            Address: server
                        }
                    })

                    if (serverExists != null) {
                        if (serverExists.Status == 5 || serverExists.Status == 9 || serverExists.Status == 0 || serverExists.Status == 1)
                            continue;

                        await prisma.server.update({
                            where: {
                                ID: serverExists.ID
                            },
                            data: {
                                Status: 0,
                                LastUpdated: null
                            }
                        })
                    } else {
                        var location = GetLocation(server.split(":")[0]);

                        createdServers.push({
                            Address: server,
                            Country: location.countryCode,
                            Latitute: location.latitude,
                            Longitude: location.longitude,
                            Status: 0,
                        })
                    }
                }

                if (createdServers.length > 0) {
                    await prisma.server.createMany({
                        data: createdServers
                    })
                }
            } else if (taskInfo.TaskKind == 2) {
                await prisma.server.update({
                    where: {
                        ID: (taskInfo.TaskData as any).serverId
                    },
                    data: {
                        Status: 5
                    }
                })
            }

            await prisma.tasks.update({
                where: {
                    ID: input.taskId
                },
                data: {
                    TaskExecuted: 1
                }
            })

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

            await prisma.tasks.update({
                where: {
                    ID: input.taskId
                },
                data: {
                    TaskExecuted: 2
                }
            })

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

            const server = await prisma.server.findFirst({
                where: {
                    Address: input.address
                },
                include: {
                    serverData: true,
                    playersData: true
                }
            });

            return server;
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

            await prisma.server.update({
                where: {
                    ID: input.serverId
                },
                data: {
                    Status: 0,
                    LastUpdated: null
                }
            })

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

            await prisma.server.update({
                where: {
                    ID: input.serverId
                },
                data: {
                    Status: 5,
                }
            })

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

            await prisma.server.update({
                where: {
                    ID: input.serverId
                },
                data: {
                    Status: input.status,
                    LastUpdated: (new Date())
                }
            })

            return { success: true };
        }),
});
