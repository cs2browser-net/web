import { NextResponse } from "next/server";
import { createCanvas, registerFont } from 'canvas';
import { queryCache } from "@/lib/cache/query-cache";
import { bannerCache } from "@/lib/cache/banner-cache";
import { prisma } from "@/lib/db/prisma";
import { ServersQueryCacheTTL } from "@/lib/consts/servers";
import { SITE_VARIANT, SiteSettings } from "@/lib/consts/settings";

registerFont("./lib/fonts/arial.ttf", { family: "ArlMd" })

export const runtime = 'nodejs'

function makeBanner(opts: any) {
    const {
        name = "My Game Server",
        ip = "127.0.0.1",
        port = 27015,
        status = "online",
        map = "de_dust2",
        players = 0,
        maxPlayers = 32,
        history = [0, 5, 10, 15, 20, 25, 30, 28, 26, 24, 22, 20, 18, 15, 10, 5, 0]
    } = opts;

    const width = 550;
    const height = 95;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#1a1d2e");
    gradient.addColorStop(0.25, "#0f1419");
    gradient.addColorStop(0.5, "#0a0d15");
    gradient.addColorStop(0.75, "#16213a");
    gradient.addColorStop(1, "#0a0d15");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#30363d";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

    ctx.fillStyle = "#00FEED";
    ctx.font = "bold 16px ArlMd";
    const truncatedName = name.length > 50 ? name.substring(0, 47) + "..." : name;
    ctx.fillText(truncatedName, 15, 25);

    const drawStat = (label: string, value: string | number, x: number, y: number, valueColor: string = "#f0f6fc") => {
        ctx.fillStyle = "#8b949e";
        ctx.font = "10px ArlMd";
        ctx.fillText(label.toUpperCase(), x, y - 2);

        ctx.fillStyle = valueColor;
        ctx.font = "bold 12px ArlMd";
        ctx.fillText(String(value), x, y + 12);
    };

    drawStat("Server", `${ip}:${port}`, 15, 55);
    drawStat("Map", map.length > 9 ? map.substring(0, 9) + "..." : map, 150, 55, "#c9d1d9");
    drawStat("Players", `${players}/${maxPlayers}`, 250, 55, "#c9d1d9");
    drawStat("Status", status.toUpperCase(), 350, 55, status === "online" ? "#22c55e" : "#ef4444");

    const graphX = 430;
    const graphY = 10;
    const graphW = 110;
    const graphH = 45;

    ctx.fillStyle = "#21262d";
    ctx.fillRect(graphX, graphY, graphW, graphH);

    ctx.strokeStyle = "#30363d";
    ctx.lineWidth = 1;
    ctx.strokeRect(graphX, graphY, graphW, graphH);

    if (history && history.length > 1) {
        const maxVal = Math.max(maxPlayers, ...history);

        const lineGradient = ctx.createLinearGradient(0, graphY, 0, graphY + graphH);
        lineGradient.addColorStop(0, "#00FEED");
        lineGradient.addColorStop(1, "#00B8AA");

        ctx.strokeStyle = lineGradient;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.beginPath();

        const points = history.map((val: number, i: number) => ({
            x: graphX + 5 + (i / (history.length - 1)) * (graphW - 10),
            y: graphY + graphH - 5 - ((val / maxVal) * (graphH - 10))
        }));

        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            if (i === points.length - 1) {
                ctx.lineTo(points[i].x, points[i].y);
            } else {
                const cpX = (points[i].x + points[i + 1].x) / 2;
                const cpY = points[i].y;
                ctx.quadraticCurveTo(points[i].x, points[i].y, cpX, cpY);
            }
        }
        ctx.stroke();
    }

    ctx.fillStyle = "#8b949e";
    ctx.font = "9px ArlMd";
    ctx.fillText("Last Players - 24H", graphX, graphY + graphH + 12);

    ctx.fillStyle = "#00FEED";
    ctx.font = "bold 11px ArlMd";
    ctx.fillText(SiteSettings[SITE_VARIANT].name.toLowerCase(), graphX, graphY + graphH + 25);

    const buffer = canvas.toBuffer("image/png");
    return buffer;
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
        `banner:${serverid}:big`,
        async () => {
            const bannerData = {
                name: "Server Offline",
                ip: "Unknown",
                port: "Unknown",
                status: "offline",
                map: "Unknown",
                players: 0,
                maxPlayers: 0,
                history: []
            };

            if (server?.serverData) {
                bannerData.name = server.serverData.Hostname || "Unknown Server";
                bannerData.ip = server.Address.split(":")[0] || "Unknown";
                bannerData.port = server.Address.split(":")[1] || "Unknown";
                bannerData.status = "online";
                bannerData.map = server.serverData.Map || "Unknown";
                bannerData.players = server.serverData.PlayersCount || 0;
                bannerData.maxPlayers = server.serverData.MaxPlayers || 0;
                // @ts-expect-error
                bannerData.history = Object.keys(server.playersData?.MaxLast24Hours!).sort().map(timestamp => server.playersData?.MaxLast24Hours![timestamp] || 0) || [];
            }

            return makeBanner(bannerData);
        },
        ServersQueryCacheTTL
    );

    return new NextResponse(new Uint8Array(bannerBuffer), {
        status: 200,
        headers: {
            "Content-Type": "image/png",
            "Content-Disposition": `inline; filename="banner-big-${serverid}.png"`,
        }
    });
}