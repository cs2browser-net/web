import { useEffect, useState } from "react";
import ServerList from "../serverview/ServerList";
import { trpc } from "@/lib/trpc/client";
import { useHiddenServers } from "@/lib/client-storage/hidden-servers";

export default function HiddenServersPage() {
    const hiddenServers = useHiddenServers();
    const [servers, setServers] = useState<any>(undefined);

    const { data } = trpc.servers.fetchServersWithId.useQuery({
        serverIds: hiddenServers.hiddenIds,
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
                    <ServerList servers={servers} currentPage={1} onPageChange={(x) => { }} pageKind={"hidden"} />
                </div>
            </div>
        </div>
    )
}