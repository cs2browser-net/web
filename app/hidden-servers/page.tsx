import PageLayout from "@/components/layouts/PageLayout";
import HiddenServersPage from "@/components/pages/HiddenServersPage";
import { defaultMetadata, defaultViewport } from "@/components/seo/metadata";
import { SITE_VARIANT, SiteSettings } from "@/lib/consts/settings";
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
    ...defaultMetadata,
    title: "Hidden Servers - " + SiteSettings[SITE_VARIANT].name,
    description: "Manage your hidden " + SiteSettings[SITE_VARIANT].gamename + " servers. View and unhide " + SITE_VARIANT.toUpperCase() + " servers you've chosen to filter from your search results.",
}

export const viewport: Viewport = defaultViewport

export default function Home() {

    return (
        <PageLayout>
            <div className="flex flex-row justify-between mx-2 md:mx-auto md:max-w-[80%] items-center">
                <HiddenServersPage />
            </div>
        </PageLayout>
    )
}