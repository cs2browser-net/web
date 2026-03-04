import PageLayout from "@/components/layouts/PageLayout";
import FavouriteServersPage from "@/components/pages/FavouritesPage";
import { defaultMetadata, defaultViewport } from "@/components/seo/metadata";
import { SITE_VARIANT, SiteSettings } from "@/lib/consts/settings";
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
    ...defaultMetadata,
    title: "Favorite Servers - " + SiteSettings[SITE_VARIANT].name,
    description: "View your favorite " + SiteSettings[SITE_VARIANT].gamename + " servers. Quick access to your most played " + SiteSettings[SITE_VARIANT].gamename + " servers and communities.",
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