"use client";

import { useEffect, useState } from "react";
import ServerList from "../serverview/ServerList";
import { trpc } from "@/lib/trpc/client";
import { useFavouriteServers } from "@/lib/client-storage/favourite-servers";

export default function FavouriteServersPage() {
    const favouriteServers = useFavouriteServers();
    const [servers, setServers] = useState<any>(undefined);

    const { data } = trpc.servers.fetchServersWithId.useQuery({
        serverIds: favouriteServers.favouriteIds,
    });

    useEffect(() => {
        if (data) {
            setServers({ servers: data, count: data.length });
        }
    }, [data]);

    return (
        <div className="w-full">
            <div className="flex flex-row w-full mt-4">
                <div className="flex-1 transition-all duration-300 ease-in-out">
                    <ServerList servers={servers} currentPage={1} onPageChange={(x) => { }} pageKind="favourites" />
                </div>
            </div>
        </div>
    )
}