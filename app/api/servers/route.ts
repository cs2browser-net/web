import { appRouter } from "@/lib/trpc/router";
import { createContext } from "@/lib/trpc/trpc";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)

    const context = await createContext();
    const caller = appRouter.createCaller(context);

    let servers;
    if (searchParams.has("servers")) {
        servers = await caller.servers.fetchServersWithId({
            serverIds: searchParams.get("servers")!.split(",") || []
        })
    } else {
        servers = await caller.servers.fetchServers({
            sort: {
                ping: searchParams.get("ping_sort") as "asc" | "desc" | undefined,
                players: searchParams.get("players_sort") as "asc" | "desc" | undefined,
            },
            showFullServers: searchParams.get("show_full_servers") === "1",
            hideEmptyServers: searchParams.get("hide_empty_servers") === "1",

            hidePings: searchParams.get("hide_pings")?.split(",").map(Number).filter(n => !isNaN(n)) || [],
            showPings: searchParams.get("show_pings")?.split(",").map(Number).filter(n => !isNaN(n)) || [],

            hideVersions: searchParams.get("hide_versions")?.split(",") || [],
            showVersions: searchParams.get("show_versions")?.split(",") || [],

            hideMaps: searchParams.get("hide_maps")?.split(",") || [],
            showMaps: searchParams.get("show_maps")?.split(",") || [],

            hideCountries: searchParams.get("hide_countries")?.split(",") || [],
            showCountries: searchParams.get("show_countries")?.split(",") || [],

            hideContinents: searchParams.get("hide_continents")?.split(",") || [],
            showContinents: searchParams.get("show_continents")?.split(",") || [],

            searchBarQuery: searchParams.get("server_name") || undefined,
            gamemode: searchParams.get("gamemode") || undefined,

            page: searchParams.get("page") ? (Number(searchParams.get("page")) || undefined) : 1,
        })
    }

    return NextResponse.json(servers);
}