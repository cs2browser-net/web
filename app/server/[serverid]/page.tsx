import PageLayout from "@/components/layouts/PageLayout";
import ServerPage from "@/components/pages/ServerPage";
import { defaultMetadata, defaultViewport } from "@/components/seo/metadata";
import { Metadata, Viewport } from "next";
import { prisma } from "@/lib/db/prisma";
import { queryCache } from "@/lib/cache/query-cache";
import { ServersQueryCacheTTL } from "@/lib/consts/servers";

type Props = {
    params: Promise<{ serverid: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { serverid } = await params;

    try {
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
                        serverData: true
                    }
                });
            },
            ServersQueryCacheTTL
        );

        if (!server) {
            return {
                ...defaultMetadata,
                title: "Server Not Found - CS2Browser.net",
            };
        }

        return {
            ...defaultMetadata,
            title: `${server.serverData?.Hostname} - CS2Browser.net`,
            description: `Join ${server.serverData?.Hostname} playing ${server.serverData?.Map}. Server IP: ${server.Address}. View detailed server information, player count, and connect directly.`,
        };
    } catch (error) {
        return {
            ...defaultMetadata,
            title: "Server - CS2Browser.net",
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