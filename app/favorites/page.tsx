import PageLayout from "@/components/layouts/PageLayout";
import FavouriteServersPage from "@/components/pages/FavouritesPage";
import { defaultMetadata, defaultViewport } from "@/components/seo/metadata";
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
    ...defaultMetadata,
    title: "Favorite Servers - CS2Browser.net",
    description: "View your favorite Counter-Strike 2 servers. Quick access to your most played CS2 servers and communities.",
}

export const viewport: Viewport = defaultViewport

export default function Home() {

    return (
        <PageLayout>
            <div className="flex flex-row justify-between mx-2 md:mx-auto md:max-w-[80%] items-center">
                <FavouriteServersPage />
            </div>
        </PageLayout>
    )
}