import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { IsIpInSubnet } from "@/lib/utils/ip";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { TRPCError } from "@trpc/server";

const RATE_LIMIT_ADD_SERVERS = 60;
const RATE_LIMIT_REPORT_SERVER = 60;
const MAX_COUNT_PER_WINDOW = 1;

export const tasksRouter = router({
    addServersTask: publicProcedure.input(
        z.object({
            serverList: z.array(z.string())
        })
    ).mutation(async (data) => {
        const { serverList } = data.input;

        for (const server of serverList) {
            if (!server.includes(":")) throw new TRPCError({
                code: 'BAD_REQUEST',
                message: `Invalid server format: ${server}. Use format IP:PORT (e.g., 192.168.1.1:27015)`
            });

            const ip = server.split(":")[0];
            const port = Number(server.split(":")[1]);

            if (isNaN(port) || port < 1 || port > 65535) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: `Invalid port number in server: ${server}. Port must be between 1 and 65535.`
                });
            }

            if (IsIpInSubnet(ip, "10.0.0.0/8")) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: `Server ${server} is in the private IP range and cannot be accessed.`
                });
            } else if (IsIpInSubnet(ip, "192.168.0.0/16")) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: `Server ${server} is in the private IP range and cannot be accessed.`
                });
            } else if (IsIpInSubnet(ip, "172.16.0.0/12")) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: `Server ${server} is in the private IP range and cannot be accessed.`
                });
            } else if (IsIpInSubnet(ip, "127.0.0.0/8")) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: `Server ${server} is in the loopback IP range and cannot be accessed.`
                });
            } else if (IsIpInSubnet(ip, "100.64.0.0/10")) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: `Server ${server} is in the carrier-grade NAT IP range and cannot be accessed.`
                });
            } else if (IsIpInSubnet(ip, "169.254.0.0/16")) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: `Server ${server} is in the link-local IP range and cannot be accessed.`
                });
            } else if (IsIpInSubnet(ip, "240.0.0.0/4")) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: `Server ${server} is in the reserved IP range and cannot be accessed.`
                });
            }
        }

        await checkRateLimit(data.ctx.ip, 'addServers', {
            windowSeconds: RATE_LIMIT_ADD_SERVERS,
            maxCount: MAX_COUNT_PER_WINDOW
        });

        await prisma.tasks.create({
            data: {
                TaskKind: 1,
                TaskData: {
                    servers: serverList,
                    submittedBy: data.ctx.ip,
                    timestamp: new Date().toISOString()
                }
            }
        })

        return { success: true };
    }),
    reportServer: publicProcedure.input(
        z.object({
            serverId: z.string(),
            reason: z.string(),
            details: z.string().optional()
        })
    ).mutation(async (data) => {
        await checkRateLimit(data.ctx.ip, 'reportServer', {
            windowSeconds: RATE_LIMIT_REPORT_SERVER,
            maxCount: MAX_COUNT_PER_WINDOW
        });

        const { serverId, reason, details } = data.input;

        await prisma.tasks.create({
            data: {
                TaskKind: 2,
                TaskData: {
                    serverId,
                    reason,
                    details,
                    submittedBy: data.ctx.ip,
                    timestamp: new Date().toISOString()
                }
            }
        })

        return { success: true };
    }),
})