import { appRouter } from "@/lib/trpc/router";
import { createContext } from "@/lib/trpc/trpc";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)

    const context = await createContext({ req });
    const caller = appRouter.createCaller(context);

    const server = await caller.servers.fetchServer({
        serverId: searchParams.get("server_id") || ""
    });

    const returnServer = server ? {
        server_info: {
            server_id: server.Server.id,
            hostname: server.ServerData?.hostname || "",
            address: server.Server.address,
            map: server.ServerData?.map || "",
            players_count: server.ServerData?.playersCount || 0,
            max_players: server.ServerData?.maxPlayers || 0,
            bots_count: server.ServerData?.botsCount || 0,
            secure: server.ServerData?.secure || false,
            version: server.ServerData?.version || "",
            tags: server.ServerData?.tags || "",
            country: server.Server.country || "",
            lat: server.Server.latitute || 0,
            lon: server.Server.longitude || 0,
        },
        players: server.PlayersData!.list,
        player_histogram: searchParams.get("mode") == "3" ? server.PlayersData!.maxLast30Days : (searchParams.get("mode") == "2" ? server.PlayersData!.maxLast7Days : server.PlayersData!.maxLast24Hours)
    } : null;

    return NextResponse.json(returnServer);
}