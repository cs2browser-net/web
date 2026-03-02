import { appRouter } from "@/lib/trpc/router";
import { createContext } from "@/lib/trpc/trpc";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)

    const context = await createContext();
    const caller = appRouter.createCaller(context);

    const server = await caller.servers.fetchServer({
        serverId: searchParams.get("server_id") || ""
    });

    const returnServer = server ? {
        server_info: {
            server_id: server.ID,
            hostname: server.serverData?.Hostname || "",
            address: server.Address,
            map: server.serverData?.Map || "",
            players_count: server.serverData?.PlayersCount || 0,
            max_players: server.serverData?.MaxPlayers || 0,
            bots_count: server.serverData?.BotsCount || 0,
            secure: server.serverData?.Secure || false,
            version: server.serverData?.Version || "",
            tags: server.serverData?.Tags || "",
            country: server.Country || "",
            lat: server.Latitute || 0,
            lon: server.Longitude || 0,
        },
        players: server.playersData!.List,
        player_histogram: searchParams.get("mode") == "3" ? server.playersData!.MaxLast30Days : (searchParams.get("mode") == "2" ? server.playersData!.MaxLast7Days : server.playersData!.MaxLast24Hours)
    } : null;

    return NextResponse.json(returnServer);
}