import { NextResponse } from "next/server";
import { createCanvas, registerFont } from 'canvas';
import { queryCache } from "@/lib/cache/query-cache";
import { bannerCache } from "@/lib/cache/banner-cache";
import { prisma } from "@/lib/db/prisma";
import { ServersQueryCacheTTL } from "@/lib/consts/servers";

registerFont("./lib/fonts/arial.ttf", { family: "ArlMd" })

export const runtime = 'nodejs'

function makeBanner(opts: any): Buffer {
    const {
        name = "My Game Server",
        status = "online",
        map = "de_dust2",
        players = 0,
        maxPlayers = 32
    } = opts;

    const width = 350;
    const height = 20;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, "#1a1d2e");
    gradient.addColorStop(0.5, "#0a0d15");
    gradient.addColorStop(1, "#16213a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#00FEED";
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
    ctx.globalAlpha = 1;

    ctx.fillStyle = "#00FEED";
    ctx.font = "bold 11px ArlMd";
    const truncatedName = name.length > 25 ? name.substring(0, 22) + "..." : name;
    ctx.fillText(`${truncatedName}`, 5, 13);

    const nameWidth = ctx.measureText(`${truncatedName}`).width;

    ctx.fillStyle = "#c9d1d9";
    ctx.font = "10px ArlMd";
    const truncatedMap = map.length > 18 ? map.substring(0, 15) + "..." : map;
    ctx.fillText(truncatedMap, nameWidth + 15, 13);

    ctx.fillStyle = "#c9d1d9";
    const playersText = `${players}/${maxPlayers}`;
    const playersX = nameWidth + 15 + ctx.measureText(truncatedMap).width + 15;
    ctx.fillText(playersText, playersX, 13);

    const statusX = playersX + ctx.measureText(playersText).width + 10;

    if (status === "online") {
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.arc(statusX + 3, 10, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#22c55e";
        ctx.font = "9px ArlMd";
        ctx.fillText("ONLINE", statusX + 10, 13);
    } else {
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(statusX + 3, 10, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ef4444";
        ctx.font = "9px ArlMd";
        ctx.fillText("OFFLINE", statusX + 10, 13);
    }

    return canvas.toBuffer("image/png");
}

export async function GET(req: Request, { params }: { params: Promise<{ serverid: string }> }) {
    const { serverid } = await params;

    const server = await queryCache.query(
        `servers:${serverid}`,
        async () => {
            return await prisma.server.findFirst({
                where: {
                    ID: serverid,
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

    const bannerBuffer = await bannerCache.generateOrGet(
        `banner:${serverid}:small`,
        async () => {
            const bannerData = {
                name: "Server Offline",
                status: "offline",
                map: "Unknown",
                players: 0,
                maxPlayers: 0
            };

            if (server?.serverData) {
                bannerData.name = server.serverData.Hostname || "Unknown Server";
                bannerData.status = "online";
                bannerData.map = server.serverData.Map || "Unknown";
                bannerData.players = server.serverData.PlayersCount || 0;
                bannerData.maxPlayers = server.serverData.MaxPlayers || 0;
            }

            return makeBanner(bannerData);
        },
        ServersQueryCacheTTL
    );

    return new NextResponse(new Uint8Array(bannerBuffer), {
        status: 200,
        headers: {
            "Content-Type": "image/png",
            "Content-Disposition": `inline; filename="banner-small-${serverid}.png"`,
        }
    });
}