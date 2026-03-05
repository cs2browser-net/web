import PageLayout from "@/components/layouts/PageLayout";
import HomePage from "@/components/pages/HomePage";
import { defaultMetadata, defaultViewport } from "@/components/seo/metadata";
import { Metadata, Viewport } from "next";
import { GamemodeSlugs } from "@/lib/filters/gamemodes";
import { SITE_VARIANT, SiteSettings } from "@/lib/consts/settings";

type Props = {
    params: Promise<{ gamemode: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { gamemode } = await params;
    const spec = GamemodeSlugs[gamemode];

    if (!spec) {
        return {
            ...defaultMetadata,
            title: "Gamemode - " + SiteSettings[SITE_VARIANT].name,
        };
    }

    const gamemodeName = spec.name;

    return {
        ...defaultMetadata,
        title: `${gamemodeName} Servers - ${SiteSettings[SITE_VARIANT].name}`,
        description: `Find the best ${SiteSettings[SITE_VARIANT].gamename} ${gamemodeName} servers. Browse and join ${SiteSettings[SITE_VARIANT].gamename} ${gamemodeName} servers by location, ping, and player count.`,
    };
}

export const viewport: Viewport = defaultViewport

export default async function Home({ params }: Props) {
    const { gamemode } = await params;

    return (
        <PageLayout>
            <div className="flex flex-row justify-between mx-2 md:mx-auto md:max-w-[80%] items-center">
                <HomePage gamemode={gamemode} />
            </div>
        </PageLayout>
    )
}