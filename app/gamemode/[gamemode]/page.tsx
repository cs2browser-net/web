import PageLayout from "@/components/layouts/PageLayout";
import HomePage from "@/components/pages/HomePage";
import { defaultMetadata, defaultViewport } from "@/components/seo/metadata";
import { Metadata, Viewport } from "next";
import { GamemodeSlugs } from "@/lib/filters/gamemodes";

type Props = {
    params: Promise<{ gamemode: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { gamemode } = await params;
    const spec = GamemodeSlugs[gamemode];
    
    if (!spec) {
        return {
            ...defaultMetadata,
            title: "Gamemode - CS2Browser.net",
        };
    }

    const gamemodeName = typeof spec.text === 'string' 
        ? spec.text 
        : spec.text[0].toString().replace(/_$/, '');
    
    const formattedName = gamemodeName.charAt(0).toUpperCase() + gamemodeName.slice(1);
    
    return {
        ...defaultMetadata,
        title: `${formattedName} Servers - CS2Browser.net`,
        description: `Find the best Counter-Strike 2 ${formattedName} servers. Browse and join CS2 ${formattedName} servers by location, ping, and player count.`,
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