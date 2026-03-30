import PageLayout from "@/components/layouts/PageLayout";
import ServerPage from "@/components/pages/ServerPage";
import { defaultMetadata, defaultViewport } from "@/components/seo/metadata";
import { Metadata, Viewport } from "next";
import { queryCache } from "@/lib/cache/query-cache";
import { ServersQueryCacheTTL } from "@/lib/consts/servers";
import { SITE_VARIANT, SiteSettings } from "@/lib/consts/settings";
import { db } from "@/lib/db/drizzle";
import { playersData, server, serverData } from "@/generated/drizzle/schema";
import { and, eq, isNotNull } from "drizzle-orm";

type Props = {
    params: Promise<{ serverid: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { serverid } = await params;

    try {
        const srv = await queryCache.query(
            `servers:${serverid}`,
            async () => {
                var servers = await db.select().from(server)
                    .leftJoin(serverData, eq(server.id, serverData.serverId))
                    .leftJoin(playersData, eq(server.id, playersData.serverId))
                    .where(
                        and(
                            eq(server.id, serverid),
                            eq(server.status, 0),
                            isNotNull(server.lastUpdated)
                        )
                    ).limit(1);

                if (servers.length === 0) return null;
                return servers[0];
            },
            ServersQueryCacheTTL
        );

        if (!srv) {
            return {
                ...defaultMetadata,
                title: "Server Not Found - " + SiteSettings[SITE_VARIANT].name,
            };
        }

        return {
            ...defaultMetadata,
            title: `${srv.ServerData?.hostname} - ${SiteSettings[SITE_VARIANT].name}`,
            description: `Join ${srv.ServerData?.hostname} playing ${srv.ServerData?.map}. Server IP: ${srv.Server.address}. View detailed server information, player count, and connect directly.`,
        };
    } catch (error) {
        return {
            ...defaultMetadata,
            title: "Server - " + SiteSettings[SITE_VARIANT].name,
        };
    }
}

export const viewport: Viewport = defaultViewport

export default async function ServerViewPage({ params }: Props) {
    const { serverid } = await params;

    return (
        <PageLayout>
            <div className="flex flex-row justify-between mx-2 md:mx-auto md:max-w-[80%] items-center">
                <ServerPage serverid={serverid} />
            </div>
        </PageLayout>
    )
}